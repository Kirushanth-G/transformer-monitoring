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
 * @param {string} imageUrl - The URL of the image to annotate.
 * @param {Array} initialAnnotations - An array of AI-detected annotations to load initially.
 * Expected format: [{ x, y, width, height, label, confidence, isCritical }]
 */
function AnnotateImageModal({ isOpen, onClose, onSave, imageUrl, initialAnnotations = [] }) {
  // --- Refs for canvases and image ---
  const imageCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);
  const imageRef = useRef(null);

  // --- State management ---
  // `boxes` holds the complete state for all annotations being worked on.
  const [boxes, setBoxes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);

  // State for real-time interaction (drawing, resizing, moving)
  const [interaction, setInteraction] = useState({ type: 'none' });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentDrawingBox, setCurrentDrawingBox] = useState(null);

  // --- Utility Functions ---

  // Get mouse coordinates relative to the canvas, accounting for scaling.
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

  // --- Drawing Logic ---

  // Draws resize handles for a selected box.
  const drawResizeHandles = (ctx, box) => {
    const handleSize = 8;
    ctx.fillStyle = '#3b82f6'; // blue-500
    const handles = getResizeHandles(box);
    Object.values(handles).forEach(pos => {
      ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
    });
  };

  // Draws the delete button for a selected box.
  const drawDeleteButton = (ctx, box) => {
    const { x, y } = getDeleteButtonCoords(box);
    const size = 20;
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', x, y);
  };

  // --- Coordinate and Hit-Detection Logic ---

  const getResizeHandles = (box) => ({
    topLeft: { x: box.x, y: box.y },
    topRight: { x: box.x + box.width, y: box.y },
    bottomLeft: { x: box.x, y: box.y + box.height },
    bottomRight: { x: box.x + box.width, y: box.y + box.height },
  });

  const getDeleteButtonCoords = (box) => ({ x: box.x + box.width, y: box.y });

  const checkInteractionType = (x, y) => {
    const selectedBox = boxes.find(b => b.id === selectedBoxId);

    if (selectedBox) {
      const handleSize = 10;
      const delBtn = getDeleteButtonCoords(selectedBox);
      if (Math.abs(x - delBtn.x) < handleSize && Math.abs(y - delBtn.y) < handleSize) {
        return { type: 'delete' };
      }

      const handles = getResizeHandles(selectedBox);
      for (const [handleName, pos] of Object.entries(handles)) {
        if (Math.abs(x - pos.x) < handleSize && Math.abs(y - pos.y) < handleSize) {
          return { type: 'resizing', handle: handleName };
        }
      }
    }

    const clickedBox = boxes.find(b =>
      b.status !== 'deleted' && x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
    );

    if (clickedBox) {
      return { type: 'moving', boxId: clickedBox.id };
    }

    return { type: 'drawing' };
  };

  // --- Effects ---

  // Effect to load the image, set up canvas dimensions, and load initial annotations.
  useEffect(() => {
    if (isOpen && imageUrl) {
        const image = new Image();
        image.crossOrigin = "anonymous"; // Handle CORS if image is from another domain
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

            // Process initial AI annotations
            const formattedBoxes = initialAnnotations.map(anno => ({
                ...anno,
                id: uuidv4(),
                status: 'ai-detected',
            }));
            setBoxes(formattedBoxes);
        };
        image.onerror = () => {
            console.error("Failed to load image for annotation.");
        };
    }
  }, [isOpen, imageUrl, initialAnnotations]);


  // THE CORE: A single effect to handle all drawing based on state changes.
  useEffect(() => {
    if (!isOpen || !annotationCanvasRef.current) return;
    const canvas = annotationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boxes.forEach(box => {
      if (box.status === 'deleted') return; // Don't draw deleted boxes

      const isSelected = selectedBoxId === box.id;
      
      // Different colors for different statuses
      if (isSelected) {
        ctx.strokeStyle = '#3b82f6'; // blue-500 for selected
        ctx.lineWidth = 3;
      } else if (box.status === 'user-added' || box.status === 'user-edited') {
        ctx.strokeStyle = '#16a34a'; // green-600 for user-modified
        ctx.lineWidth = 2;
      } else { // 'ai-detected'
        ctx.strokeStyle = '#facc15'; // yellow-400 for AI
        ctx.lineWidth = 2;
      }

      ctx.strokeRect(box.x, box.y, box.width, box.height);

      if (isSelected) {
        drawResizeHandles(ctx, box);
        drawDeleteButton(ctx, box);
      }
    });

    if (currentDrawingBox) {
      ctx.strokeStyle = '#16a34a'; // green-600 while drawing
      ctx.lineWidth = 2;
      ctx.strokeRect(currentDrawingBox.x, currentDrawingBox.y, currentDrawingBox.width, currentDrawingBox.height);
    }
  }, [boxes, selectedBoxId, currentDrawingBox, isOpen]);

  // --- Event Handlers ---

  const handleMouseDown = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    setStartPoint({ x, y });

    const interactionResult = checkInteractionType(x, y);

    if (interactionResult.type === 'delete') {
      setBoxes(boxes.map(box => {
        if (box.id === selectedBoxId) {
          // If it was an AI box, mark as deleted. If user-added, remove it.
          return box.status === 'ai-detected' || box.status === 'user-edited'
            ? { ...box, status: 'deleted' }
            : null;
        }
        return box;
      }).filter(Boolean)); // filter(Boolean) removes nulls
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

    switch (interaction.type) {
      case 'drawing': {
        const width = x - startPoint.x;
        const height = y - startPoint.y;
        setCurrentDrawingBox({ x: startPoint.x, y: startPoint.y, width, height });
        break;
      }
      case 'moving': {
        setBoxes(boxes.map(box => {
          if (box.id === interaction.boxId) {
            return {
              ...box,
              x: x - (startPoint.x - box.x),
              y: y - (startPoint.y - box.y),
              status: box.status === 'ai-detected' ? 'user-edited' : box.status,
            };
          }
          return box;
        }));
        break;
      }
      case 'resizing': {
        setBoxes(boxes.map(box => {
          if (box.id === selectedBoxId) {
            const newBox = { ...box };
            const { handle } = interaction;
            if (handle.includes('Left')) {
                newBox.width = newBox.x + newBox.width - x;
                newBox.x = x;
            }
            if (handle.includes('Right')) {
                newBox.width = x - newBox.x;
            }
            if (handle.includes('Top')) {
                newBox.height = newBox.y + newBox.height - y;
                newBox.y = y;
            }
            if (handle.includes('Bottom')) {
                newBox.height = y - newBox.y;
            }
            return { ...newBox, status: newBox.status === 'ai-detected' ? 'user-edited' : newBox.status };
          }
          return box;
        }));
        break;
      }
      default:
        break;
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
        const finalBox = { ...newBox, id: uuidv4(), status: 'user-added' };
        setBoxes([...boxes, finalBox]);
        setSelectedBoxId(finalBox.id);
      }
    } else if (interaction.type === 'resizing' || interaction.type === 'moving') {
        // Normalize box dimensions after interaction
        setBoxes(boxes.map(box => {
            if (box.width < 0) {
                box.x += box.width;
                box.width = Math.abs(box.width);
            }
            if (box.height < 0) {
                box.y += box.height;
                box.height = Math.abs(box.height);
            }
            return box;
        }));
    }

    setInteraction({ type: 'none' });
    setCurrentDrawingBox(null);
  };
  
  // Clears all user modifications and resets to initial AI state.
  const handleClear = () => {
     const formattedBoxes = initialAnnotations.map(anno => ({
        ...anno,
        id: uuidv4(),
        status: 'ai-detected',
    }));
    setBoxes(formattedBoxes);
    setSelectedBoxId(null);
  };

  // Process and save all annotations
  const handleSave = () => {
    const feedback = {
      added: boxes.filter(b => b.status === 'user-added'),
      edited: boxes.filter(b => b.status === 'user-edited'),
      deleted: boxes.filter(b => b.status === 'deleted'),
    };
    onSave(feedback);
    onClose(); // Close modal after saving
  };


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
            <div className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-yellow-400 border border-gray-400"></span>
                <span className="text-xs">AI Detected</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-green-600 border border-gray-400"></span>
                <span className="text-xs">User Modified</span>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="px-4 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm font-medium"
          >
            Reset to AI Detections
          </button>
        </div>

        <div className="overflow-auto flex-grow flex items-center justify-center bg-gray-100 rounded-md" 
             style={{ height: 'calc(85vh - 120px)' }}>
          <div className="relative" style={{ width: 'fit-content' }}>
            <canvas ref={imageCanvasRef} className="block rounded-md shadow-md" />
            <canvas
              ref={annotationCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp} // End interaction if mouse leaves canvas
              className="absolute top-0 left-0 cursor-crosshair"
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
          >
            Save Annotations
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnotateImageModal;
