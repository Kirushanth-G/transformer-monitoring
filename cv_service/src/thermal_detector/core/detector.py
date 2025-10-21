"""Core thermal anomaly detection logic."""

import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from math import exp

from ..core.config import DetectionConfig
from ..utils.image_utils import (
    load_rgb_image, normalize_image_contrast, resize_image_to_match,
    register_images_affine, convert_rgb_to_hsv_normalized, apply_median_filter
)


class ThermalAnomalyDetector:
    """Thermal anomaly detector using YOLO + thermal analysis rules."""
    
    # Classification labels and their colors for visualization
    ANOMALY_CLASSES = {
        "Loose Joint Critical": (0, 0, 255),      # Red
        "Overload Critical": (0, 128, 255),       # Orange
        "Loose Joint Warning": (0, 255, 255),     # Yellow
        "Wire Overload": (255, 0, 0),             # Blue
    }
    
    SEVERITY_MAPPING = {
        "critical": {"Loose Joint Critical", "Overload Critical"},
        "warning": {"Loose Joint Warning", "Wire Overload"}
    }
    
    def __init__(self, model, config: DetectionConfig):
        """Initialize detector with pre-loaded YOLO model and configuration."""
        self.model = model
        self.config = config
        # Ensure model stays on CPU
        try:
            self.model.to("cpu")
        except Exception:
            pass
    
    def detect_anomalies(
        self, 
        maintenance_image_path: str,
        baseline_image_path: Optional[str] = None,
        save_annotation: Optional[str] = None,
        device: int = -1,
        image_size: int = 640,
        use_half_precision: bool = False,
        return_web_format: bool = True,
        config_overrides: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Detect thermal anomalies in maintenance image.
        
        Args:
            maintenance_image_path: Path to maintenance thermal image
            baseline_image_path: Optional baseline image for comparison
            save_annotation: Optional path to save annotated image
            device: Device for inference (0=GPU, -1=CPU)
            image_size: Input image size for YOLO
            use_half_precision: Use FP16 precision
            return_web_format: Return web-friendly format
            config_overrides: Override configuration parameters
            
        Returns:
            Detection results dictionary
        """
        # Update configuration with any overrides
        if config_overrides:
            self.config.update_config(config_overrides)
        
        # Load and preprocess images
        maintenance_rgb = load_rgb_image(maintenance_image_path)
        maintenance_normalized = normalize_image_contrast(maintenance_rgb)
        
        baseline_value_channel = None
        if baseline_image_path:
            baseline_rgb = load_rgb_image(baseline_image_path)
            baseline_normalized = normalize_image_contrast(baseline_rgb)
            
            # Align images
            maintenance_normalized = resize_image_to_match(baseline_normalized, maintenance_normalized)
            maintenance_normalized = register_images_affine(baseline_normalized, maintenance_normalized)
            
            # Extract baseline value channel for comparison
            baseline_hsv = convert_rgb_to_hsv_normalized(baseline_normalized)
            baseline_value_channel = baseline_hsv[..., 2]
        
        # Convert maintenance image to HSV for thermal analysis
        maintenance_hsv = convert_rgb_to_hsv_normalized(maintenance_normalized)
        
        # Run YOLO detection on original image
        yolo_detections = self._run_yolo_detection(
            maintenance_rgb, device, image_size, use_half_precision
        )
        
        # Process YOLO detections with thermal rules
        processed_detections = []
        for detection in yolo_detections:
            thermal_result = self._analyze_thermal_region(
                maintenance_hsv, baseline_value_channel, detection
            )
            if thermal_result:
                processed_detections.append(thermal_result)
        
        # Apply fallback detection if no valid detections found
        if not processed_detections and self.config.enable_fallback:
            fallback_detections = self._fallback_detection(
                maintenance_hsv, baseline_value_channel
            )
            processed_detections.extend(fallback_detections)
        
        # Generate final results
        results = self._generate_results(
            processed_detections, maintenance_image_path, maintenance_rgb
        )
        
        # Save annotated image if requested
        if save_annotation:
            self._save_annotated_image(
                maintenance_rgb, processed_detections, save_annotation
            )
            results["annotated_image"] = save_annotation
        
        return results["detections"] if return_web_format else results
    
    def _run_yolo_detection(
        self, image: np.ndarray, device: int, image_size: int, use_half: bool
    ) -> List[Dict[str, Any]]:
        """Run YOLO inference and return filtered detections."""
        predictions = self.model.predict(
            image, device="cpu", half=use_half, imgsz=image_size, verbose=False
        )[0]
        
        detections = []
        if len(predictions.boxes):
            boxes = predictions.boxes.xyxy.cpu().numpy()
            confidences = predictions.boxes.conf.cpu().numpy()
            
            for (x1, y1, x2, y2), confidence in zip(boxes, confidences):
                if confidence >= self.config.yolo_confidence:
                    detections.append({
                        "bbox": (int(x1), int(y1), int(x2 - x1), int(y2 - y1)),
                        "confidence": float(confidence)
                    })
        
        return detections
    
    def _analyze_thermal_region(
        self, 
        hsv_image: np.ndarray, 
        baseline_v: Optional[np.ndarray], 
        detection: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Analyze thermal characteristics of detected region."""
        x, y, w, h = detection["bbox"]
        height, width = hsv_image.shape[:2]
        
        # Clamp coordinates to image boundaries
        x = max(0, min(x, width - 1))
        y = max(0, min(y, height - 1))
        w = max(1, min(w, width - x))
        h = max(1, min(h, height - y))
        
        # Extract region of interest
        roi = hsv_image[y:y+h, x:x+w]
        hue_roi, sat_roi, val_roi = roi[..., 0], roi[..., 1], roi[..., 2]
        
        # Thermal color analysis (warm colors: red/orange/yellow)
        warm_hue_mask = (hue_roi <= 0.17) | (hue_roi >= 0.95)
        warm_sat_mask = sat_roi >= self.config.get_param("thermal_analysis.color_thresholds.saturation_min", 0.35)
        warm_val_mask = val_roi >= self.config.get_param("thermal_analysis.color_thresholds.value_min", 0.5)
        
        # Contrast analysis
        val_roi_filtered = apply_median_filter(val_roi, 31)
        
        if baseline_v is not None:
            baseline_roi = baseline_v[y:y+h, x:x+w]
            baseline_filtered = apply_median_filter(baseline_roi, 31)
            delta_value = val_roi - baseline_filtered
        else:
            baseline_filtered = np.zeros_like(val_roi_filtered)
            delta_value = val_roi - val_roi_filtered
        
        delta_luminance = val_roi - val_roi_filtered
        
        # Apply thresholds
        dv_threshold = self.config.get_param("thermal_analysis.color_thresholds.delta_value_min", 0.12)
        dl_threshold = self.config.get_param("thermal_analysis.color_thresholds.delta_luminance_min", 0.08)
        
        contrast_mask = (delta_value >= dv_threshold) | (delta_luminance >= dl_threshold)
        warm_mask = warm_hue_mask & warm_sat_mask & warm_val_mask & contrast_mask
        
        # Hot region analysis (stricter criteria)
        hot_sat_threshold = self.config.get_param("thermal_analysis.hot_zone_thresholds.saturation_min_hot", 0.45)
        hot_val_threshold = self.config.get_param("thermal_analysis.hot_zone_thresholds.value_min_hot", 0.65)
        hot_dv_threshold = self.config.get_param("thermal_analysis.hot_zone_thresholds.delta_value_min_hot", 0.18)
        
        hot_sat_mask = sat_roi >= hot_sat_threshold
        hot_val_mask = val_roi >= hot_val_threshold
        hot_contrast_mask = (delta_value >= hot_dv_threshold) | (delta_luminance >= dl_threshold)
        hot_mask = warm_hue_mask & hot_sat_mask & hot_val_mask & hot_contrast_mask
        
        # Count pixels and validate
        warm_pixels = int(warm_mask.sum())
        hot_pixels = int(hot_mask.sum())
        
        min_pixels = max(4, int(self.config.get_param("thermal_analysis.shape_analysis.minimum_area_fraction", 0.001) * height * width))
        
        if warm_pixels < min_pixels:
            return None  # Insufficient thermal signature
        
        # Classify anomaly type
        area_fraction = warm_pixels / (height * width)
        aspect_ratio = max(w, h) / max(1, min(w, h))
        
        anomaly_class = self._classify_anomaly_type(area_fraction, aspect_ratio, hot_pixels >= min_pixels)
        
        return {
            "x": x, "y": y, "width": w, "height": h,
            "confidence": detection["confidence"],
            "class": anomaly_class,
            "is_critical": hot_pixels >= min_pixels,
            "thermal_area_fraction": float(area_fraction),
            "aspect_ratio": float(aspect_ratio),
            "warm_pixels": warm_pixels,
            "hot_pixels": hot_pixels
        }
    
    def _classify_anomaly_type(self, area_fraction: float, aspect_ratio: float, is_hot: bool) -> str:
        """Classify anomaly based on thermal and geometric characteristics."""
        loose_threshold = self.config.get_param("thermal_analysis.shape_analysis.loose_joint_area_threshold", 0.1)
        wire_aspect_min = self.config.get_param("thermal_analysis.shape_analysis.wire_aspect_ratio_min", 2.2)
        wire_area_max = self.config.get_param("thermal_analysis.shape_analysis.wire_area_max", 0.25)
        
        if area_fraction >= loose_threshold:
            return "Loose Joint Critical" if is_hot else "Loose Joint Warning"
        elif aspect_ratio >= wire_aspect_min and area_fraction < wire_area_max:
            return "Wire Overload"
        else:
            return "Overload Critical" if is_hot else "Loose Joint Warning"
    
    def _fallback_detection(
        self, hsv_image: np.ndarray, baseline_v: Optional[np.ndarray]
    ) -> List[Dict[str, Any]]:
        """Generate detections using thermal rules when YOLO finds nothing."""
        # Calculate global thermal probability
        thermal_prob = self._calculate_global_thermal_probability(hsv_image, baseline_v)
        
        if thermal_prob < self.config.fallback_threshold:
            return []
        
        # Generate warm mask for the entire image
        warm_mask = self._generate_global_warm_mask(hsv_image, baseline_v)
        
        # Find connected components and create bounding boxes
        detections = []
        for bbox in self._extract_bounding_boxes_from_mask(warm_mask):
            thermal_result = self._analyze_thermal_region(
                hsv_image, baseline_v, {"bbox": bbox, "confidence": thermal_prob}
            )
            if thermal_result:
                detections.append(thermal_result)
        
        return detections
    
    def _calculate_global_thermal_probability(
        self, hsv_image: np.ndarray, baseline_v: Optional[np.ndarray]
    ) -> float:
        """Calculate probability of thermal anomaly in entire image."""
        hue, sat, val = hsv_image[..., 0], hsv_image[..., 1], hsv_image[..., 2]
        
        # Thermal color masks
        warm_hue_mask = (hue <= 0.17) | (hue >= 0.95)
        warm_sat_mask = sat >= self.config.get_param("thermal_analysis.color_thresholds.saturation_min", 0.35)
        warm_val_mask = val >= self.config.get_param("thermal_analysis.color_thresholds.value_min", 0.5)
        
        # Contrast analysis
        val_filtered = apply_median_filter(val, 31)
        
        if baseline_v is not None:
            baseline_filtered = apply_median_filter(baseline_v, 31)
            delta_value = val - baseline_filtered
        else:
            delta_value = val - val_filtered
        
        delta_luminance = val - val_filtered
        
        dv_threshold = self.config.get_param("thermal_analysis.color_thresholds.delta_value_min", 0.12)
        dl_threshold = self.config.get_param("thermal_analysis.color_thresholds.delta_luminance_min", 0.08)
        
        contrast_mask = (delta_value >= dv_threshold) | (delta_luminance >= dl_threshold)
        warm_mask = warm_hue_mask & warm_sat_mask & warm_val_mask & contrast_mask
        
        # Calculate metrics
        warm_fraction = float(warm_mask.mean())
        delta_95th_percentile = float(np.quantile(np.maximum(0.0, delta_value).ravel(), 0.95))
        
        # Combine metrics into probability score
        combined_score = delta_95th_percentile + 2.0 * warm_fraction
        probability = 1.0 / (1.0 + exp(-combined_score))
        
        return probability
    
    def _generate_global_warm_mask(
        self, hsv_image: np.ndarray, baseline_v: Optional[np.ndarray]
    ) -> np.ndarray:
        """Generate binary mask of warm/hot regions in entire image."""
        hue, sat, val = hsv_image[..., 0], hsv_image[..., 1], hsv_image[..., 2]
        
        warm_hue_mask = (hue <= 0.17) | (hue >= 0.95)
        warm_sat_mask = sat >= self.config.get_param("thermal_analysis.color_thresholds.saturation_min", 0.35)
        warm_val_mask = val >= self.config.get_param("thermal_analysis.color_thresholds.value_min", 0.5)
        
        val_filtered = apply_median_filter(val, 31)
        
        if baseline_v is not None:
            baseline_filtered = apply_median_filter(baseline_v, 31)
            delta_value = val - baseline_filtered
        else:
            delta_value = val - val_filtered
        
        delta_luminance = val - val_filtered
        
        dv_threshold = self.config.get_param("thermal_analysis.color_thresholds.delta_value_min", 0.12)
        dl_threshold = self.config.get_param("thermal_analysis.color_thresholds.delta_luminance_min", 0.08)
        
        contrast_mask = (delta_value >= dv_threshold) | (delta_luminance >= dl_threshold)
        warm_mask = (warm_hue_mask & warm_sat_mask & warm_val_mask & contrast_mask).astype(np.uint8)
        
        # Apply morphological opening to clean up the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        return cv2.morphologyEx(warm_mask, cv2.MORPH_OPEN, kernel)
    
    def _extract_bounding_boxes_from_mask(self, mask: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Extract bounding boxes from connected components in binary mask."""
        height, width = mask.shape
        min_area = max(32, int(self.config.get_param("thermal_analysis.shape_analysis.minimum_area_fraction", 0.001) * height * width))
        
        # Find connected components
        num_components, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
        
        bounding_boxes = []
        for i in range(1, num_components):  # Skip background (component 0)
            x, y, w, h, area = stats[i]
            if area >= min_area:
                bounding_boxes.append((int(x), int(y), int(w), int(h)))
        
        return bounding_boxes
    
    def _generate_results(
        self, detections: List[Dict[str, Any]], image_path: str, original_image: np.ndarray
    ) -> Dict[str, Any]:
        """Generate final results dictionary."""
        # Determine overall assessment
        has_critical = any(d["is_critical"] for d in detections)
        has_warning = any(not d["is_critical"] for d in detections)
        
        if has_critical:
            overall_grade = "critical"
        elif has_warning:
            overall_grade = "warning"
        else:
            overall_grade = "normal"
        
        # Calculate overall anomaly score
        critical_weight = 1.0
        warning_weight = 0.7
        
        scores = []
        for detection in detections:
            weight = critical_weight if detection["is_critical"] else warning_weight
            scores.append(weight * detection["confidence"])
        
        anomaly_score = max(scores) if scores else 0.0
        
        # Format detections for web response
        web_detections = []
        for detection in detections:
            web_detections.append({
                "x": detection["x"],
                "y": detection["y"],
                "width": detection["width"],
                "height": detection["height"],
                "label": detection["class"],
                "confidence": detection["confidence"],
                "area": detection["width"] * detection["height"]
            })
        
        return {
            "image_path": image_path,
            "overall_assessment": overall_grade,
            "anomaly_score": float(anomaly_score),
            "detections": web_detections,
            "detection_count": len(detections),
            "image_dimensions": {
                "height": original_image.shape[0],
                "width": original_image.shape[1]
            }
        }
    
    def _save_annotated_image(
        self, original_image: np.ndarray, detections: List[Dict[str, Any]], save_path: str
    ):
        """Save annotated image with detection bounding boxes."""
        # Convert RGB to BGR for OpenCV
        annotated_image = cv2.cvtColor(original_image, cv2.COLOR_RGB2BGR).copy()
        
        for detection in detections:
            x, y, w, h = detection["x"], detection["y"], detection["width"], detection["height"]
            class_name = detection["class"]
            confidence = detection["confidence"]
            
            # Get color for this class
            color = self.ANOMALY_CLASSES.get(class_name, (200, 200, 200))
            
            # Draw bounding box
            cv2.rectangle(annotated_image, (x, y), (x + w, y + h), color, 2)
            
            # Draw label with background
            label = f"{class_name} {confidence:.2f}"
            (text_width, text_height), _ = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
            )
            
            # Label background
            cv2.rectangle(
                annotated_image, (x, y - 18), (x + text_width + 6, y), color, -1
            )
            
            # Label text
            cv2.putText(
                annotated_image, label, (x + 3, y - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA
            )
        
        # Create output directory if needed
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Save image
        cv2.imwrite(save_path, annotated_image)