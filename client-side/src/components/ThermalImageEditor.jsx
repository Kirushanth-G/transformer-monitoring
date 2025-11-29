import React, { useState, useRef, useEffect } from 'react';
import BoundingBox from './BoundingBox';
import { thermalApi } from '../services/thermalApi';
import {
  pixelsToPercentage,
  percentageToPixels,
  getImageRelativeCoordinates,
  screenToApiCoordinates,
  normalizeBoundingBox,
  isValidBoundingBox
} from '../utils/coordinateTransform';

/**
 * ThermalImageEditor Component
 * Interactive canvas for viewing and editing thermal analysis bounding boxes
 */
const ThermalImageEditor = ({
  analysis,
  imageUrl,
  currentUser = 'user@example.com',
  isEditing = true,
  onDetectionsChange,
  showSuccess,
  showError
}) => {
  // State
  const [detections, setDetections] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [drawCurrent, setDrawCurrent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [originalBox, setOriginalBox] = useState(null);
  
  // Refs
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const getOriginalDimensions = () => {
    const width = analysis?.originalWidth || naturalDimensions.width || imgDimensions.width;
    const height = analysis?.originalHeight || naturalDimensions.height || imgDimensions.height;
    return { width, height };
  };

  // Load detections when analysis/dimensions change
  useEffect(() => {
    const originalWidth = analysis?.originalWidth || naturalDimensions.width || imgDimensions.width;
    const originalHeight = analysis?.originalHeight || naturalDimensions.height || imgDimensions.height;

    if (analysis?.detections && originalWidth && originalHeight) {
      const convertedDetections = analysis.detections
        .filter(d => d.annotationStatus !== 'DELETED')
        .map(detection => {
          const percentages = pixelsToPercentage(
            detection.x,
            detection.y,
            detection.width,
            detection.height,
            originalWidth,
            originalHeight
          );

          return {
            ...detection,
            left: percentages.left,
            top: percentages.top,
            width: percentages.width,
            height: percentages.height
          };
        });

      setDetections(convertedDetections);
    }
  }, [
    analysis,
    naturalDimensions.width,
    naturalDimensions.height,
    imgDimensions.width,
    imgDimensions.height
  ]);

  // Update image dimensions when image loads
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImgDimensions({
        width: imageRef.current.offsetWidth,
        height: imageRef.current.offsetHeight
      });

      setNaturalDimensions({
        width: imageRef.current.naturalWidth || imageRef.current.offsetWidth,
        height: imageRef.current.naturalHeight || imageRef.current.offsetHeight
      });
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        setImgDimensions({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================
  // Drawing New Box
  // ============================================================

  const handleMouseDown = (e) => {
    if (!isEditing) return;
    
    // Only start drawing if clicking directly on the image (not on a box)
    if (e.target !== imageRef.current && e.target !== containerRef.current) {
      return;
    }

    const coords = getImageRelativeCoordinates(e, imageRef.current);
    setIsDrawing(true);
    setDrawStart(coords);
    setDrawCurrent(coords);
    setSelectedBoxId(null); // Deselect any selected box
  };

  const handleMouseMove = (e) => {
    if (!isEditing) return;

    if (isDrawing && drawStart) {
      const coords = getImageRelativeCoordinates(e, imageRef.current);
      setDrawCurrent(coords);
    } else if (isDragging && dragStart && originalBox) {
      handleDragMove(e);
    } else if (isResizing && dragStart && originalBox && resizeDirection) {
      handleResizeMove(e);
    }
  };

  const handleMouseUp = async () => {
    if (!isEditing) return;

    if (isDrawing && drawStart && drawCurrent) {
      await finishDrawing();
    } else if (isDragging) {
      await finishDragging();
    } else if (isResizing) {
      await finishResizing();
    }
  };

  const finishDrawing = async () => {
    try {
      const normalized = normalizeBoundingBox(
        drawStart.x,
        drawStart.y,
        drawCurrent.x,
        drawCurrent.y
      );

      // Validate minimum size (at least 20x20 pixels on screen)
      if (normalized.width < 20 || normalized.height < 20) {
        showError('Box is too small. Please draw a larger area.');
        resetDrawing();
        return;
      }

      const { width: originalWidth, height: originalHeight } = getOriginalDimensions();

      if (!originalWidth || !originalHeight) {
        showError('Image dimensions not ready. Please wait for the image to finish loading.');
        resetDrawing();
        return;
      }

      // Convert screen coordinates to API pixel coordinates
      const apiCoords = screenToApiCoordinates(
        normalized.x,
        normalized.y,
        originalWidth,
        originalHeight,
        imgDimensions.width,
        imgDimensions.height
      );

      const apiWidth = Math.round((normalized.width / imgDimensions.width) * originalWidth);
      const apiHeight = Math.round((normalized.height / imgDimensions.height) * originalHeight);

      // Validate bounding box
      if (!isValidBoundingBox(
        { ...apiCoords, width: apiWidth, height: apiHeight },
        originalWidth,
        originalHeight,
        10
      )) {
        showError('Invalid bounding box. Please draw within image bounds.');
        resetDrawing();
        return;
      }

      // Prepare payload for API
      const payload = {
        analysisId: analysis.id,
        x: apiCoords.x,
        y: apiCoords.y,
        width: apiWidth,
        height: apiHeight,
        label: 'Hotspot', // Default label
        modifiedBy: currentUser,
        userComments: 'Manual addition'
      };

      console.log('Adding new anomaly:', payload);
      const newAnomaly = await thermalApi.addAnomaly(payload);
      
      // Convert to percentage for display
      const percentages = pixelsToPercentage(
        newAnomaly.x,
        newAnomaly.y,
        newAnomaly.width,
        newAnomaly.height,
        originalWidth,
        originalHeight
      );

      const newDetection = {
        ...newAnomaly,
        left: percentages.left,
        top: percentages.top,
        width: percentages.width,
        height: percentages.height
      };

      setDetections(prev => [...prev, newDetection]);
      showSuccess('New detection added successfully');
      
      if (onDetectionsChange) {
        onDetectionsChange([...detections, newDetection]);
      }
    } catch (error) {
      console.error('Error adding anomaly:', error);
      showError(error.message || 'Failed to add detection');
    } finally {
      resetDrawing();
    }
  };

  const resetDrawing = () => {
    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  };

  // ============================================================
  // Moving Box
  // ============================================================

  const handleStartMove = (boxId, e) => {
    if (!isEditing) return;
    
    e.stopPropagation();
    const coords = getImageRelativeCoordinates(e, imageRef.current);
    const box = detections.find(d => d.id === boxId);
    
    setIsDragging(true);
    setDragStart(coords);
    setOriginalBox(box);
    setSelectedBoxId(boxId);
  };

  const handleDragMove = (e) => {
    if (!originalBox || !dragStart) return;

    const coords = getImageRelativeCoordinates(e, imageRef.current);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    // Convert delta to percentage
    const deltaXPercent = (deltaX / imgDimensions.width) * 100;
    const deltaYPercent = (deltaY / imgDimensions.height) * 100;

    // Update box position
    setDetections(prev => prev.map(d => 
      d.id === originalBox.id
        ? {
            ...d,
            left: originalBox.left + deltaXPercent,
            top: originalBox.top + deltaYPercent
          }
        : d
    ));
  };

  const finishDragging = async () => {
    if (!originalBox) {
      setIsDragging(false);
      setDragStart(null);
      setOriginalBox(null);
      return;
    }

    try {
      const updatedBox = detections.find(d => d.id === originalBox.id);
      const { width: originalWidth, height: originalHeight } = getOriginalDimensions();

      if (!originalWidth || !originalHeight) {
        showError('Image dimensions not ready. Reverting move.');
        setDetections(prev => prev.map(d => d.id === originalBox.id ? originalBox : d));
        setIsDragging(false);
        setDragStart(null);
        setOriginalBox(null);
        return;
      }
      
      // Convert percentage back to pixels for API
      const apiCoords = percentageToPixels(
        updatedBox.left,
        updatedBox.top,
        updatedBox.width,
        updatedBox.height,
        originalWidth,
        originalHeight
      );

      // Validate
      if (!isValidBoundingBox(apiCoords, originalWidth, originalHeight, 10)) {
        showError('Box moved out of bounds. Reverting.');
        setDetections(prev => prev.map(d => d.id === originalBox.id ? originalBox : d));
        setIsDragging(false);
        setDragStart(null);
        setOriginalBox(null);
        return;
      }

      const payload = {
        analysisId: analysis.id,
        x: apiCoords.x,
        y: apiCoords.y,
        width: apiCoords.width,
        height: apiCoords.height,
        label: updatedBox.label || 'Hotspot',
        userComments: 'Position updated',
        modifiedBy: currentUser
      };

      console.log('Updating anomaly position:', payload);
      await thermalApi.updateAnomaly(originalBox.id, payload);
      
      showSuccess('Detection moved successfully');
      
      if (onDetectionsChange) {
        onDetectionsChange(detections);
      }
    } catch (error) {
      console.error('Error updating anomaly:', error);
      showError(error.message || 'Failed to move detection');
      // Revert on error
      setDetections(prev => prev.map(d => d.id === originalBox.id ? originalBox : d));
    } finally {
      setIsDragging(false);
      setDragStart(null);
      setOriginalBox(null);
    }
  };

  // ============================================================
  // Resizing Box
  // ============================================================

  const handleStartResize = (boxId, direction, e) => {
    if (!isEditing) return;
    
    e.stopPropagation();
    const coords = getImageRelativeCoordinates(e, imageRef.current);
    const box = detections.find(d => d.id === boxId);
    
    setIsResizing(true);
    setResizeDirection(direction);
    setDragStart(coords);
    setOriginalBox(box);
    setSelectedBoxId(boxId);
  };

  const handleResizeMove = (e) => {
    if (!originalBox || !dragStart || !resizeDirection) return;

    const coords = getImageRelativeCoordinates(e, imageRef.current);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    // Convert delta to percentage
    const deltaXPercent = (deltaX / imgDimensions.width) * 100;
    const deltaYPercent = (deltaY / imgDimensions.height) * 100;

    let newBox = { ...originalBox };

    // Apply resize based on direction
    switch (resizeDirection) {
      case 'nw':
        newBox.left = originalBox.left + deltaXPercent;
        newBox.top = originalBox.top + deltaYPercent;
        newBox.width = originalBox.width - deltaXPercent;
        newBox.height = originalBox.height - deltaYPercent;
        break;
      case 'n':
        newBox.top = originalBox.top + deltaYPercent;
        newBox.height = originalBox.height - deltaYPercent;
        break;
      case 'ne':
        newBox.top = originalBox.top + deltaYPercent;
        newBox.width = originalBox.width + deltaXPercent;
        newBox.height = originalBox.height - deltaYPercent;
        break;
      case 'e':
        newBox.width = originalBox.width + deltaXPercent;
        break;
      case 'se':
        newBox.width = originalBox.width + deltaXPercent;
        newBox.height = originalBox.height + deltaYPercent;
        break;
      case 's':
        newBox.height = originalBox.height + deltaYPercent;
        break;
      case 'sw':
        newBox.left = originalBox.left + deltaXPercent;
        newBox.width = originalBox.width - deltaXPercent;
        newBox.height = originalBox.height + deltaYPercent;
        break;
      case 'w':
        newBox.left = originalBox.left + deltaXPercent;
        newBox.width = originalBox.width - deltaXPercent;
        break;
      default:
        break;
    }

    // Ensure minimum size (1% of image)
    if (newBox.width < 1 || newBox.height < 1) return;

    setDetections(prev => prev.map(d => d.id === originalBox.id ? newBox : d));
  };

  const finishResizing = async () => {
    if (!originalBox) {
      setIsResizing(false);
      setResizeDirection(null);
      setDragStart(null);
      setOriginalBox(null);
      return;
    }

    try {
      const resizedBox = detections.find(d => d.id === originalBox.id);
      const { width: originalWidth, height: originalHeight } = getOriginalDimensions();

      if (!originalWidth || !originalHeight) {
        showError('Image dimensions not ready. Reverting resize.');
        setDetections(prev => prev.map(d => d.id === originalBox.id ? originalBox : d));
        setIsResizing(false);
        setResizeDirection(null);
        setDragStart(null);
        setOriginalBox(null);
        return;
      }
      
      // Convert percentage back to pixels for API
      const apiCoords = percentageToPixels(
        resizedBox.left,
        resizedBox.top,
        resizedBox.width,
        resizedBox.height,
        originalWidth,
        originalHeight
      );

      // Validate
      if (!isValidBoundingBox(apiCoords, originalWidth, originalHeight, 10)) {
        showError('Invalid box size. Reverting.');
        setDetections(prev => prev.map(d => d.id === originalBox.id ? originalBox : d));
        setIsResizing(false);
        setResizeDirection(null);
        setDragStart(null);
        setOriginalBox(null);
        return;
      }

      const payload = {
        analysisId: analysis.id,
        x: apiCoords.x,
        y: apiCoords.y,
        width: apiCoords.width,
        height: apiCoords.height,
        label: resizedBox.label || 'Hotspot',
        userComments: 'Size adjusted',
        modifiedBy: currentUser
      };

      console.log('Updating anomaly size:', payload);
      await thermalApi.updateAnomaly(originalBox.id, payload);
      
      showSuccess('Detection resized successfully');
      
      if (onDetectionsChange) {
        onDetectionsChange(detections);
      }
    } catch (error) {
      console.error('Error updating anomaly:', error);
      showError(error.message || 'Failed to resize detection');
      // Revert on error
      setDetections(prev => prev.map(d => d.id === originalBox.id ? originalBox : d));
    } finally {
      setIsResizing(false);
      setResizeDirection(null);
      setDragStart(null);
      setOriginalBox(null);
    }
  };

  // ============================================================
  // Box Actions
  // ============================================================

  const handleDeleteBox = async (boxId) => {
    if (!window.confirm('Are you sure you want to delete this detection?')) {
      return;
    }

    try {
      console.log('Deleting anomaly:', boxId);
      await thermalApi.deleteAnomaly(boxId, currentUser);
      
      setDetections(prev => prev.filter(d => d.id !== boxId));
      setSelectedBoxId(null);
      showSuccess('Detection deleted successfully');
      
      if (onDetectionsChange) {
        onDetectionsChange(detections.filter(d => d.id !== boxId));
      }
    } catch (error) {
      console.error('Error deleting anomaly:', error);
      showError(error.message || 'Failed to delete detection');
    }
  };

  const handleConfirmBox = async (boxId) => {
    try {
      console.log('Confirming anomaly:', boxId);
      await thermalApi.confirmAnomaly(boxId, currentUser);
      
      setDetections(prev => prev.map(d => 
        d.id === boxId 
          ? { ...d, annotationStatus: 'CONFIRMED' }
          : d
      ));
      
      showSuccess('Detection confirmed successfully');
      
      if (onDetectionsChange) {
        onDetectionsChange(detections);
      }
    } catch (error) {
      console.error('Error confirming anomaly:', error);
      showError(error.message || 'Failed to confirm detection');
    }
  };

  // ============================================================
  // Render
  // ============================================================

  const renderDrawingBox = () => {
    if (!isDrawing || !drawStart || !drawCurrent) return null;

    const normalized = normalizeBoundingBox(
      drawStart.x,
      drawStart.y,
      drawCurrent.x,
      drawCurrent.y
    );

    return (
      <div
        style={{
          position: 'absolute',
          left: `${normalized.x}px`,
          top: `${normalized.y}px`,
          width: `${normalized.width}px`,
          height: `${normalized.height}px`,
          border: '2px dashed #60A5FA',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          pointerEvents: 'none',
          zIndex: 1004
        }}
      />
    );
  };

  if (!analysis || !imageUrl) {
    return (
      <div className="text-center text-gray-500 p-8">
        No thermal analysis data available
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Image Container */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          userSelect: 'none',
          cursor: isEditing ? 'crosshair' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDrawing || isDragging || isResizing) {
            handleMouseUp();
          }
        }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Thermal analysis"
          onLoad={handleImageLoad}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            pointerEvents: 'none'
          }}
        />

        {/* Bounding Boxes */}
        {detections.map(detection => (
          <BoundingBox
            key={detection.id}
            detection={detection}
            isSelected={selectedBoxId === detection.id}
            isEditing={isEditing}
            onSelect={setSelectedBoxId}
            onDelete={handleDeleteBox}
            onConfirm={handleConfirmBox}
            onStartResize={handleStartResize}
            onStartMove={handleStartMove}
          />
        ))}

        {/* Drawing Preview */}
        {renderDrawingBox()}
      </div>
    </div>
  );
};

export default ThermalImageEditor;
