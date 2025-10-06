# Thermal Anomaly Detection System

A high-performance FastAPI-based system for detecting electrical equipment anomalies in thermal images using YOLO object detection combined with advanced thermal analysis rules.

## Features

- **YOLO Object Detection**: Pre-trained model for thermal anomaly detection
- **Thermal Analysis Rules**: Advanced HSV color space analysis for thermal signature validation
- **Model Persistence**: Efficient model loading (loads once at startup, not per request)
- **Baseline Comparison**: Optional baseline image comparison for improved accuracy
- **Sensitivity Control**: Adjustable detection sensitivity (0-100%)
- **Web-Ready API**: RESTful API with comprehensive documentation
- **Automatic Fallback**: Rule-based detection when YOLO misses anomalies

## Detected Anomaly Classes

- **Loose Joint Critical** - Severe loose connection requiring immediate attention
- **Overload Critical** - Critical electrical overload condition  
- **Loose Joint Warning** - Potential loose connection for monitoring
- **Wire Overload** - Wire carrying excessive current

## Quick Start

### Prerequisites

- Python 3.10+
- UV package manager

### Installation

```bash
# Clone or create project directory
mkdir thermal-detector && cd thermal-detector

# Initialize UV project
uv init .

# Install dependencies
uv add fastapi uvicorn ultralytics opencv-python numpy requests pydantic

# Copy your trained model to src/thermal_detector/models/thermal_model.pt
```

### Running the Server

```bash
# Development
uv run python src/thermal_detector/main.py

# Production
uv run uvicorn thermal_detector.main:app --host 0.0.0.0 --port 8000
```

### API Usage

Access the interactive API documentation at: `http://localhost:8000/docs`

#### Basic Analysis Request

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "maintenance_image_path": "/path/to/thermal/image.jpg",
    "sensitivity_percentage": 50
  }'
```

#### Advanced Request with Baseline

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "maintenance_image_path": "http://your-server.com/files/maintenance.jpg",
    "baseline_image_path": "http://your-server.com/files/baseline.jpg",
    "save_annotation_path": "outputs/annotated.jpg",
    "sensitivity_percentage": 75,
    "processing_device": 0,
    "input_image_size": 640
  }'
```

### Response Format

```json
{
  "detections": [
    {
      "x": 150,
      "y": 200, 
      "width": 80,
      "height": 60,
      "label": "Loose Joint Critical",
      "confidence": 0.87,
      "area": 4800
    }
  ]
}
```

## Configuration

The system uses `config/detection_params.json` for threshold configuration:

- **Detection thresholds**: YOLO confidence, fallback probability
- **Thermal analysis**: Color and contrast thresholds for warm/hot detection
- **Shape analysis**: Area and aspect ratio criteria for classification

## Development

### Project Structure

```
thermal-detector/
├── src/thermal_detector/
│   ├── main.py              # FastAPI application
│   ├── core/
│   │   ├── detector.py      # Main detection logic
│   │   └── config.py        # Configuration management
│   ├── utils/
│   │   └── image_utils.py   # Image processing utilities
│   └── models/
│       └── thermal_model.pt # YOLO model weights
└── config/
    └── detection_params.json # System configuration
```

### Key Optimizations

- **Model Persistence**: YOLO model loaded once at server startup
- **Efficient Image Processing**: Optimized OpenCV operations
- **Smart Fallback**: Rule-based detection when needed
- **Memory Management**: Proper cleanup of temporary files

