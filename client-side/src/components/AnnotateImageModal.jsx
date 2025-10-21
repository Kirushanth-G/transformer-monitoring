import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * An advanced image annotation modal for Phase 3.
 *
 * This component allows users to validate, correct, add, and delete annotations
 * on an image. It's designed to work with an initial set of AI-detected anomalies.
 *
 * @param {boolean} isOpen - Controls if the modal is visible.
 * @param {function} onClose - Function to call when closing the modal without saving.
 * @param {function} onSave - Function to call when saving annotations. It receives an object
 * with all the annotation changes ({ added, edited, deleted }).
 * @param {object} thermalAnalysisResult - The full analysis result object which contains the image URL and initial detections.
 * @param {string} currentUserId - ID of the current user for metadata tracking.
 * @param {string} transformerId - ID of the transformer being analyzed.
 * @param {string} imageId - Unique identifier for the image being annotated.
 */
function AnnotateImageModal({ 
  isOpen, 
  onClose, 
  onSave, 
  thermalAnalysisResult, 
  currentUserId = 'unknown-user',
  transformerId,
  imageId 
}) {
  // Destructure props safely, providing default empty values
  const { maintenanceImageUrl: imageUrl, detections: initialAnnotations = [] } = thermalAnalysisResult || {};

  const imageCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);
  const imageRef = useRef(null);

  const [boxes, setBoxes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [interaction, setInteraction] = useState({ type: 'none' });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentDrawingBox, setCurrentDrawingBox] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [pendingAnnotation, setPendingAnnotation] = useState(null);
  const [annotationHistory, setAnnotationHistory] = useState([]);

  // Helper function to create annotation metadata
  const createAnnotationMetadata = (action, annotationData, comment = '') => ({
    id: uuidv4(),
    userId: currentUserId,
    timestamp: new Date().toISOString(),
    imageId,
    transformerId,
    action, // 'added', 'edited', 'deleted'
    comment,
    ...annotationData
  });

  // Log annotation action for feedback integration (FR3.3)
  const logAnnotationAction = (action, annotationData, comment = '') => {
    const logEntry = createAnnotationMetadata(action, annotationData, comment);
    setAnnotationHistory(prev => [...prev, logEntry]);
    
    // Auto-save to backend (FR3.2 requirement)
    if (typeof onSave === 'function') {
      // This will be called immediately for each action, not just on modal close
      const currentFeedback = {
        added: boxes.filter(b => b.status === 'user-added'),
        edited: boxes.filter(b => b.status === 'user-edited'),
        deleted: boxes.filter(b => b.status === 'deleted'),
        history: [...annotationHistory, logEntry],
        metadata: {
          userId: currentUserId,
          timestamp: new Date().toISOString(),
          imageId,
          transformerId
        }
      };
      // You might want to debounce this or make it async
      // onSave(currentFeedback);
    }
  };

  const getCanvasCoords = (e) => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawResizeHandles = (ctx, box) => {
    const handleSize = 10;
    ctx.fillStyle = '#3b82f6'; // blue-500
    const handles = getResizeHandles(box);
    Object.values(handles).forEach(pos => {
      ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
    });
  };

  const drawDeleteButton = (ctx, box) => {
    const { x, y } = getDeleteButtonCoords(box);
    const size = 22;
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', x, y + 1);
  };

  const getResizeHandles = (box) => ({
    topLeft: { x: box.x, y: box.y },
    topRight: { x: box.x + box.width, y: box.y },
    bottomLeft: { x: box.x, y: box.y + box.height },
    bottomRight: { x: box.x + box.width, y: box.y + box.height },
    top: {x: box.x + box.width/2, y: box.y},
    bottom: {x: box.x + box.width/2, y: box.y + box.height},
    left: {x: box.x, y: box.y + box.height/2},
    right: {x: box.x + box.width, y: box.y + box.height/2},
  });

  const getDeleteButtonCoords = (box) => ({ x: box.x + box.width, y: box.y });

  // Determines what action to perform based on mouse position
  const getInteractionType = (x, y) => {
    const selectedBox = boxes.find(b => b.id === selectedBoxId);
    if (selectedBox) {
      const handleSize = 12; // Larger hit area for handles
      const delBtn = getDeleteButtonCoords(selectedBox);
      if (Math.sqrt((x-delBtn.x)**2 + (y-delBtn.y)**2) < handleSize) {
        return { type: 'delete', cursor: 'pointer' };
      }

      const handles = getResizeHandles(selectedBox);
      for (const [handleName, pos] of Object.entries(handles)) {
        if (Math.abs(x - pos.x) < handleSize/2 && Math.abs(y - pos.y) < handleSize/2) {
            if (handleName === 'topLeft' || handleName === 'bottomRight') return { type: 'resizing', handle: handleName, cursor: 'nwse-resize' };
            if (handleName === 'topRight' || handleName === 'bottomLeft') return { type: 'resizing', handle: handleName, cursor: 'nesw-resize' };
            if (handleName === 'top' || handleName === 'bottom') return { type: 'resizing', handle: handleName, cursor: 'ns-resize' };
            if (handleName === 'left' || handleName === 'right') return { type: 'resizing', handle: handleName, cursor: 'ew-resize' };
        }
      }
    }

    const clickedBox = boxes.find(b =>
      b.status !== 'deleted' && x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
    );

    if (clickedBox) {
      return { type: 'moving', boxId: clickedBox.id, cursor: 'move' };
    }

    return { type: 'drawing', cursor: 'crosshair' };
  };

  // Load image and initialize annotations
  useEffect(() => {
    if (isOpen && imageUrl) {
        const image = new Image();
        image.src = imageUrl;
        image.onload = () => {
            imageRef.current = image;
            const imageCanvas = imageCanvasRef.current;
            const annotationCanvas = annotationCanvasRef.current;
            if (!imageCanvas || !annotationCanvas) return;

            imageCanvas.width = image.naturalWidth;
            imageCanvas.height = image.naturalHeight;
            annotationCanvas.width = image.naturalWidth;
            annotationCanvas.height = image.naturalHeight;

            const ctx = imageCanvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            const formattedBoxes = initialAnnotations.map(anno => ({
                ...anno,
                id: anno.id || uuidv4(),
                status: 'ai-detected',
                originalDetection: true,
                metadata: createAnnotationMetadata('ai-detected', anno)
            }));
            setBoxes(formattedBoxes);
        };
        image.onerror = () => console.error("Failed to load image for annotation.");
    }
  }, [isOpen, imageUrl, initialAnnotations]);

  // Core drawing loop
  useEffect(() => {
    if (!isOpen || !annotationCanvasRef.current) return;
    const canvas = annotationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boxes.forEach(box => {
      if (box.status === 'deleted') return;
      const isSelected = selectedBoxId === box.id;
      
      if (isSelected) {
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3;
      } else if (box.status === 'user-added' || box.status === 'user-edited') {
        ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2;
      }
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      if (isSelected) {
        drawResizeHandles(ctx, box);
        drawDeleteButton(ctx, box);
      }
    });

    if (currentDrawingBox) {
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentDrawingBox.x, currentDrawingBox.y, currentDrawingBox.width, currentDrawingBox.height);
    }
  }, [boxes, selectedBoxId, currentDrawingBox, isOpen]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    setStartPoint({ x, y });
    const interactionResult = getInteractionType(x, y);

    if (interactionResult.type === 'delete') {
      const boxToDelete = boxes.find(box => box.id === selectedBoxId);
      setBoxes(boxes.map(box => {
        if (box.id === selectedBoxId) {
          const updatedBox = box.status === 'ai-detected' || box.status === 'user-edited' 
            ? { ...box, status: 'deleted', metadata: createAnnotationMetadata('deleted', box) } 
            : null;
          
          if (updatedBox) {
            logAnnotationAction('deleted', boxToDelete);
          }
          return updatedBox;
        }
        return box;
      }).filter(Boolean));
      setSelectedBoxId(null);
      setInteraction({ type: 'none' });
      return;
    }

    if (interactionResult.type === 'moving') {
      setSelectedBoxId(interactionResult.boxId);
    } else {
      setSelectedBoxId(null);
    }

    setInteraction(interactionResult);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const canvas = annotationCanvasRef.current;
    if (canvas) {
        canvas.style.cursor = getInteractionType(x, y).cursor;
    }
    
    if (interaction.type === 'none') return;
    
    const dx = x - startPoint.x;
    const dy = y - startPoint.y;

    switch (interaction.type) {
      case 'drawing':
        setCurrentDrawingBox({ x: startPoint.x, y: startPoint.y, width: dx, height: dy });
        break;
      case 'moving':
        setBoxes(boxes.map(box => {
          if (box.id === interaction.boxId) {
            const updatedBox = {
              ...box,
              x: box.x + dx,
              y: box.y + dy,
              status: box.status === 'ai-detected' ? 'user-edited' : box.status,
              metadata: box.status === 'ai-detected' ? createAnnotationMetadata('edited', box) : box.metadata
            };
            return updatedBox;
          }
          return box;
        }));
        setStartPoint({ x, y });
        break;
      case 'resizing':
        setBoxes(boxes.map(box => {
          if (box.id === selectedBoxId) {
            const newBox = { ...box };
            const { handle } = interaction;
            if (handle.includes('Left')) { newBox.x += dx; newBox.width -= dx; }
            if (handle.includes('Right')) { newBox.width += dx; }
            if (handle.includes('Top')) { newBox.y += dy; newBox.height -= dy; }
            if (handle.includes('Bottom')) { newBox.height += dy; }
            return { 
              ...newBox, 
              status: newBox.status === 'ai-detected' ? 'user-edited' : newBox.status,
              metadata: newBox.status === 'ai-detected' ? createAnnotationMetadata('edited', newBox) : newBox.metadata
            };
          }
          return box;
        }));
        setStartPoint({ x, y });
        break;
      default: break;
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    if (interaction.type === 'drawing' && currentDrawingBox) {
      const newBox = {
        x: currentDrawingBox.width < 0 ? currentDrawingBox.x + currentDrawingBox.width : currentDrawingBox.x,
        y: currentDrawingBox.height < 0 ? currentDrawingBox.y + currentDrawingBox.height : currentDrawingBox.y,
        width: Math.abs(currentDrawingBox.width),
        height: Math.abs(currentDrawingBox.height),
      };
      if (newBox.width > 5 && newBox.height > 5) {
        const finalBox = { 
          ...newBox, 
          id: uuidv4(), 
          status: 'user-added',
          metadata: createAnnotationMetadata('added', newBox)
        };
        setPendingAnnotation(finalBox);
        setShowCommentModal(true);
      }
    } else if (interaction.type === 'resizing') {
        const editedBox = boxes.find(box => box.id === selectedBoxId);
        if (editedBox && editedBox.status === 'user-edited') {
          logAnnotationAction('edited', editedBox);
        }
        
        // Normalize box dimensions if resized in a negative direction
        setBoxes(boxes.map(box => {
            if (box.id === selectedBoxId) {
                const normalizedBox = {...box};
                if (normalizedBox.width < 0) {
                    normalizedBox.x = normalizedBox.x + normalizedBox.width;
                    normalizedBox.width = Math.abs(normalizedBox.width);
                }
                if (normalizedBox.height < 0) {
                    normalizedBox.y = normalizedBox.y + normalizedBox.height;
                    normalizedBox.height = Math.abs(normalizedBox.height);
                }
                return normalizedBox;
            }
            return box;
        }));
    } else if (interaction.type === 'moving') {
        const editedBox = boxes.find(box => box.id === interaction.boxId);
        if (editedBox && editedBox.status === 'user-edited') {
          logAnnotationAction('edited', editedBox);
        }
    }

    setInteraction({ type: 'none' });
    setCurrentDrawingBox(null);
  };

  const handleCommentSubmit = () => {
    if (pendingAnnotation) {
      const finalBox = {
        ...pendingAnnotation,
        comment: currentComment,
        metadata: {
          ...pendingAnnotation.metadata,
          comment: currentComment
        }
      };
      setBoxes([...boxes, finalBox]);
      setSelectedBoxId(finalBox.id);
      logAnnotationAction('added', finalBox, currentComment);
    }
    setShowCommentModal(false);
    setCurrentComment('');
    setPendingAnnotation(null);
  };

  const handleCommentCancel = () => {
    setShowCommentModal(false);
    setCurrentComment('');
    setPendingAnnotation(null);
  };
  
  const handleClear = () => {
    const formattedBoxes = initialAnnotations.map(anno => ({
      ...anno,
      id: uuidv4(),
      status: 'ai-detected',
      originalDetection: true,
      metadata: createAnnotationMetadata('ai-detected', anno)
    }));
    setBoxes(formattedBoxes);
    setSelectedBoxId(null);
    logAnnotationAction('reset', { message: 'Reset to AI detections' });
  };

  const handleSave = () => {
    const feedback = {
      added: boxes.filter(b => b.status === 'user-added'),
      edited: boxes.filter(b => b.status === 'user-edited'),
      deleted: boxes.filter(b => b.status === 'deleted'),
      originalDetections: initialAnnotations,
      history: annotationHistory,
      metadata: {
        userId: currentUserId,
        timestamp: new Date().toISOString(),
        imageId,
        transformerId,
        totalAnnotations: boxes.length,
        userModifications: boxes.filter(b => b.status !== 'ai-detected').length
      }
    };
    onSave(feedback);
    onClose();
  };

  const selectedBox = boxes.find(b => b.id === selectedBoxId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 w-[90vw] max-w-[1200px] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Review & Annotate Detections</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-3xl font-light">&times;</button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 flex items-center space-x-4">
            <span>Click and drag to draw. Click a box to select, move, resize, or delete.</span>
            <div className="flex items-center space-x-2"><span className="w-4 h-4" style={{backgroundColor: '#facc15'}}></span><span className="text-xs">AI Detected</span></div>
            <div className="flex items-center space-x-2"><span className="w-4 h-4" style={{backgroundColor: '#16a34a'}}></span><span className="text-xs">User Modified</span></div>
            <div className="flex items-center space-x-2"><span className="w-4 h-4 border-2" style={{borderColor: '#3b82f6'}}></span><span className="text-xs">Selected</span></div>
          </div>
          <button onClick={handleClear} className="px-4 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm font-medium">Reset to AI Detections</button>
        </div>

        {/* Annotation Details Panel */}
        {selectedBox && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-blue-900">Selected Annotation</h4>
                <p className="text-sm text-blue-700">Status: {selectedBox.status.replace('-', ' ').toUpperCase()}</p>
                <p className="text-sm text-blue-700">
                  Position: ({Math.round(selectedBox.x)}, {Math.round(selectedBox.y)}) 
                  Size: {Math.round(selectedBox.width)} × {Math.round(selectedBox.height)}
                </p>
                {selectedBox.comment && (
                  <p className="text-sm text-blue-700 mt-1">Comment: "{selectedBox.comment}"</p>
                )}
              </div>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {selectedBox.metadata?.timestamp ? new Date(selectedBox.metadata.timestamp).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        )}

        <div className="overflow-auto flex-grow flex items-center justify-center bg-gray-100 rounded-md" style={{ height: 'calc(85vh - 180px)' }}>
          <div className="relative" style={{ width: 'fit-content' }}>
            <canvas ref={imageCanvasRef} className="block rounded-md shadow-md" />
            <canvas
              ref={annotationCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="absolute top-0 left-0"
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            User: {currentUserId} | Modifications: {boxes.filter(b => b.status !== 'ai-detected').length} | 
            Total Annotations: {boxes.filter(b => b.status !== 'deleted').length}
          </div>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Save Annotations</button>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Add Comment (Optional)</h3>
            <textarea
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              placeholder="Describe this annotation..."
              className="w-full h-24 p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button 
                onClick={handleCommentCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Skip
              </button>
              <button 
                onClick={handleCommentSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Annotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnotateImageModal;

