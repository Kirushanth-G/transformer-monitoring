"""Configuration management for thermal detection system."""

import json
from pathlib import Path
from typing import Dict, Any

class DetectionConfig:
    """Configuration manager for thermal detection parameters."""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            # Default config path
            base_dir = Path(__file__).parent.parent.parent
            config_path = base_dir / "config" / "detection_params.json"
        
        self.config_path = Path(config_path)
        self._config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Config file not found: {self.config_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in config file: {e}")
    
    def get_param(self, path: str, default=None):
        """Get configuration parameter using dot notation (e.g., 'detection.yolo_confidence_threshold')."""
        keys = path.split('.')
        value = self._config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
    
    def update_config(self, overrides: Dict[str, Any]):
        """Update configuration with overrides (deep merge)."""
        if not overrides:
            return
        
        def deep_merge(target: dict, source: dict):
            for key, value in source.items():
                if isinstance(value, dict) and isinstance(target.get(key), dict):
                    deep_merge(target[key], value)
                else:
                    target[key] = value
        
        deep_merge(self._config, overrides)
    
    @property
    def yolo_confidence(self) -> float:
        return self.get_param("detection.yolo_confidence_threshold", 0.2)
    
    @property
    def enable_fallback(self) -> bool:
        return self.get_param("detection.enable_fallback_detection", True)
    
    @property
    def fallback_threshold(self) -> float:
        return self.get_param("detection.fallback_probability_threshold", 0.4)