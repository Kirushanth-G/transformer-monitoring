"""Image processing utilities for thermal detection."""

import cv2
import numpy as np
from pathlib import Path
import tempfile
import requests
from urllib.parse import urlparse
from typing import Optional, Tuple


def is_url(path: str) -> bool:
    """Check if the given path is a URL."""
    try:
        result = urlparse(path)
        return result.scheme in ("http", "https")
    except:
        return False


def download_image(url: str) -> str:
    """Download image from URL and return local temporary file path."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    
    # Determine file extension from content type
    content_type = response.headers.get("Content-Type", "")
    if "png" in content_type:
        suffix = ".png"
    elif "jpeg" in content_type or "jpg" in content_type:
        suffix = ".jpg"
    else:
        suffix = ".jpg"  # Default
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_file.write(response.content)
    temp_file.close()
    
    return temp_file.name


def get_local_image_path(path_or_url: str) -> str:
    """Convert URL or ID to local file path, downloading if necessary."""
    # If it's already a local file that exists, return it
    if Path(path_or_url).exists():
        return path_or_url
    
    # If it's a URL, download it
    if is_url(path_or_url):
        return download_image(path_or_url)
    
    # If it looks like an ID, construct URL (customize this for your backend)
    # Assuming format: http://localhost:8080/files/{id}
    base_url = "http://localhost:8080"  # Make this configurable if needed
    url = f"{base_url}/files/{path_or_url}"
    return download_image(url)


def load_rgb_image(image_path: str) -> np.ndarray:
    """Load image and convert to RGB format."""
    bgr_image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if bgr_image is None:
        raise FileNotFoundError(f"Could not load image: {image_path}")
    return cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)


def normalize_image_contrast(rgb_image: np.ndarray) -> np.ndarray:
    """Normalize image contrast using histogram equalization on V channel."""
    hsv_image = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2HSV)
    h, s, v = cv2.split(hsv_image)
    
    # Apply histogram equalization to V (brightness) channel only
    v_normalized = cv2.equalizeHist(v)
    
    # Merge channels back and convert to RGB
    hsv_normalized = cv2.merge([h, s, v_normalized])
    return cv2.cvtColor(hsv_normalized, cv2.COLOR_HSV2RGB)


def resize_image_to_match(target_image: np.ndarray, source_image: np.ndarray) -> np.ndarray:
    """Resize source image to match target image dimensions."""
    target_height, target_width = target_image.shape[:2]
    return cv2.resize(source_image, (target_width, target_height), interpolation=cv2.INTER_AREA)


def register_images_affine(reference_image: np.ndarray, candidate_image: np.ndarray) -> np.ndarray:
    """Register candidate image to reference using affine transformation."""
    # Convert to grayscale for registration
    ref_gray = cv2.cvtColor(reference_image, cv2.COLOR_RGB2GRAY)
    cand_gray = cv2.cvtColor(candidate_image, cv2.COLOR_RGB2GRAY)
    
    # Initialize transformation matrix
    warp_matrix = np.eye(2, 3, dtype=np.float32)
    
    try:
        # Find optimal affine transformation
        criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 100, 1e-6)
        _, warp_matrix = cv2.findTransformECC(
            ref_gray, cand_gray, warp_matrix, 
            cv2.MOTION_AFFINE, criteria
        )
        
        # Apply transformation
        height, width = ref_gray.shape
        aligned_image = cv2.warpAffine(
            candidate_image, warp_matrix, (width, height),
            flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP
        )
        return aligned_image
        
    except cv2.error:
        # If registration fails, return original image
        return candidate_image


def convert_rgb_to_hsv_normalized(rgb_image: np.ndarray) -> np.ndarray:
    """Convert RGB image to HSV with normalized values [0,1]."""
    hsv = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 0] /= 179.0  # Hue: 0-179 -> 0-1
    hsv[..., 1] /= 255.0  # Saturation: 0-255 -> 0-1  
    hsv[..., 2] /= 255.0  # Value: 0-255 -> 0-1
    return hsv


def apply_median_filter(image: np.ndarray, kernel_size: int = 31) -> np.ndarray:
    """Apply median filter to reduce noise."""
    if len(image.shape) == 2:  # Grayscale
        filtered = cv2.medianBlur((image * 255).astype(np.uint8), kernel_size)
        return filtered.astype(np.float32) / 255.0
    else:
        # Apply to each channel separately
        result = np.zeros_like(image)
        for i in range(image.shape[2]):
            channel = (image[..., i] * 255).astype(np.uint8)
            filtered = cv2.medianBlur(channel, kernel_size)
            result[..., i] = filtered.astype(np.float32) / 255.0
        return result