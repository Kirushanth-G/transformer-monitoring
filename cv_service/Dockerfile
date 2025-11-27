FROM python:3.11-slim

WORKDIR /app

# Install system libraries needed for OpenCV
# UPDATED: 'libgl1-mesa-glx' replaced with 'libgl1' for newer Debian versions
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your code
COPY src/ ./src/
COPY config/ ./config/

# Set Python path to include src directory
ENV PYTHONPATH=/app/src

# Start the FastAPI server
CMD ["uvicorn", "thermal_detector.main:app", "--host", "0.0.0.0", "--port", "8000"]