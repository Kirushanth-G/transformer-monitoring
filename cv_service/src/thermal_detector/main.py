"""FastAPI server for thermal image anomaly detection."""

import os
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ultralytics import YOLO

from thermal_detector.core.detector import ThermalAnomalyDetector
from thermal_detector.core.config import DetectionConfig
from thermal_detector.utils.image_utils import get_local_image_path


# Initialize FastAPI app
app = FastAPI(
    title="Thermal Anomaly Detection API",
    description="AI-powered thermal image analysis for electrical equipment monitoring",
    version="1.0.0"
)

# Global variables for model and detector (loaded once at startup)
_detector: Optional[ThermalAnomalyDetector] = None
_config: Optional[DetectionConfig] = None


class ThermalAnalysisRequest(BaseModel):
    """Request model for thermal image analysis."""
    maintenance_image_path: str
    baseline_image_path: Optional[str] = None
    save_annotation_path: Optional[str] = None
    processing_device: int = -1  # -1 for CPU, 0+ for GPU
    input_image_size: int = 640
    use_half_precision: bool = False
    web_response_format: bool = True
    sensitivity_percentage: Optional[int] = None  # 0-100 sensitivity control
    config_overrides: Optional[Dict[str, Any]] = None


def calculate_sensitivity_overrides(sensitivity_percent: Optional[int]) -> Dict[str, Any]:
    """Convert sensitivity percentage to configuration overrides."""
    if sensitivity_percent is None:
        return {}
    
    # Clamp to valid range
    sensitivity = max(0, min(100, int(sensitivity_percent)))
    normalized_sensitivity = sensitivity / 100.0
    
    # Define sensitivity ranges for different thresholds
    low_sensitivity = {
        "thermal_analysis": {
            "color_thresholds": {"delta_value_min": 0.08, "delta_luminance_min": 0.05},
            "hot_zone_thresholds": {"delta_value_min_hot": 0.15}
        }
    }
    
    high_sensitivity = {
        "thermal_analysis": {
            "color_thresholds": {"delta_value_min": 0.22, "delta_luminance_min": 0.14},
            "hot_zone_thresholds": {"delta_value_min_hot": 0.30}
        }
    }
    
    # Linear interpolation between low and high sensitivity
    def interpolate_value(low_val: float, high_val: float) -> float:
        return round(low_val + normalized_sensitivity * (high_val - low_val), 4)
    
    return {
        "thermal_analysis": {
            "color_thresholds": {
                "delta_value_min": interpolate_value(
                    low_sensitivity["thermal_analysis"]["color_thresholds"]["delta_value_min"],
                    high_sensitivity["thermal_analysis"]["color_thresholds"]["delta_value_min"]
                ),
                "delta_luminance_min": interpolate_value(
                    low_sensitivity["thermal_analysis"]["color_thresholds"]["delta_luminance_min"],
                    high_sensitivity["thermal_analysis"]["color_thresholds"]["delta_luminance_min"]
                )
            },
            "hot_zone_thresholds": {
                "delta_value_min_hot": interpolate_value(
                    low_sensitivity["thermal_analysis"]["hot_zone_thresholds"]["delta_value_min_hot"],
                    high_sensitivity["thermal_analysis"]["hot_zone_thresholds"]["delta_value_min_hot"]
                )
            }
        }
    }


def merge_configurations(base_config: Dict[str, Any], overrides: Dict[str, Any]) -> Dict[str, Any]:
    """Deep merge configuration overrides into base configuration."""
    if not overrides:
        return base_config
    
    result = dict(base_config)
    
    def deep_merge(target: dict, source: dict):
        for key, value in source.items():
            if isinstance(value, dict) and isinstance(target.get(key), dict):
                deep_merge(target[key], value)
            else:
                target[key] = value
    
    deep_merge(result, overrides)
    return result


@app.on_event("startup")
async def load_model_and_detector():
    """Load YOLO model and initialize detector at startup."""
    global _detector, _config
    
    try:
        # Define paths
        base_directory = Path(__file__).parent.parent.parent
        model_path = base_directory / "src" / "thermal_detector" / "models" / "thermal_model.pt"
        config_path = base_directory / "config" / "detection_params.json"
        
        # Verify files exist
        if not model_path.exists():
            raise FileNotFoundError(f"YOLO model not found at: {model_path}")
        if not config_path.exists():
            raise FileNotFoundError(f"Configuration file not found at: {config_path}")
        
        # Load YOLO model
        print(f"Loading YOLO model from: {model_path}")
        yolo_model = YOLO(str(model_path))
        
        # Load configuration
        print(f"Loading configuration from: {config_path}")
        _config = DetectionConfig(str(config_path))
        
        # Initialize detector
        _detector = ThermalAnomalyDetector(yolo_model, _config)
        
        print("✅ Thermal anomaly detector initialized successfully!")
        
    except Exception as e:
        print(f"❌ Failed to initialize detector: {e}")
        raise e


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "detector_loaded": _detector is not None,
        "config_loaded": _config is not None
    }


@app.get("/info")
async def system_info():
    """Get system information."""
    return {
        "api_title": "Thermal Anomaly Detection API",
        "version": "1.0.0",
        "supported_classes": list(ThermalAnomalyDetector.ANOMALY_CLASSES.keys()),
        "detector_ready": _detector is not None
    }


@app.post("/analyze")
async def analyze_thermal_image(request: ThermalAnalysisRequest):
    """
    Analyze thermal image for anomalies.
    
    This endpoint accepts thermal images (maintenance and optional baseline)
    and returns detected anomalies with their classifications and locations.
    """
    if _detector is None:
        raise HTTPException(
            status_code=503, 
            detail="Detector not initialized. Please check server logs."
        )
    
    try:
        # Convert image paths to local files (download if URLs)
        maintenance_local_path = get_local_image_path(request.maintenance_image_path)
        baseline_local_path = None
        
        if request.baseline_image_path:
            baseline_local_path = get_local_image_path(request.baseline_image_path)
        
        # Calculate sensitivity-based configuration overrides
        sensitivity_overrides = calculate_sensitivity_overrides(request.sensitivity_percentage)
        
        # Merge all configuration overrides
        final_overrides = merge_configurations(
            sensitivity_overrides,
            request.config_overrides or {}
        )
        
        # Run detection
        results = _detector.detect_anomalies(
            maintenance_image_path=maintenance_local_path,
            baseline_image_path=baseline_local_path,
            save_annotation=request.save_annotation_path,
            device=request.processing_device,
            image_size=request.input_image_size,
            use_half_precision=request.use_half_precision,
            return_web_format=request.web_response_format,
            config_overrides=final_overrides
        )
        
        return results
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Image file not found: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")


if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment variables
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"Starting Thermal Anomaly Detection API server...")
    print(f"Server will be available at: http://{host}:{port}")
    print(f"API Documentation: http://{host}:{port}/docs")
    
    uvicorn.run(
        "thermal_detector.main:app",
        host=host,
        port=port,
        reload=False  # Set to True for development
    )