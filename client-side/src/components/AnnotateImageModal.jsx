import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * The improved AnnotateImageModal component.
 * It uses a state-driven approach with useEffect to handle all canvas drawing,
 * which resolves race conditions and makes the component more reliable.
 */
function AnnotateImageModal({ isOpen, onClose, imageUrl }) {
  // --- Refs for canvases and image ---
  const imageCanvasRef = useRef(null);      // For the base image
  const annotationCanvasRef = useRef(null); // For drawing annotations
  const imageRef = useRef(null);            // To hold the loaded image element

  // --- State management ---
  const [boxes, setBoxes] = useState([]);   // Array of all annotation boxes {x, y, width, height}
  const [selectedBox, setSelectedBox] = useState(null); // Index of the selected box
  
  // State for interaction (drawing, resizing, moving)
  const [interaction, setInteraction] = useState({ type: 'none' }); // 'none', 'drawing', 'resizing', 'moving'
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentDrawingBox, setCurrentDrawingBox] = useState(null); // Temp box while drawing

  // --- Utility Functions ---

  // Helper to get mouse coordinates relative to the canvas
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

  // Draws the resize handles for a selected box
  const drawResizeHandles = (ctx, box) => {
    const handleSize = 8;
    ctx.fillStyle = '#3b82f6'; // Tailwind's blue-500
    const handles = getResizeHandles(box);
    Object.values(handles).forEach(pos => {
      ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
    });
  };

  // Draws the delete button for a selected box
  const drawDeleteButton = (ctx, box) => {
    const { x, y } = getDeleteButtonCoords(box);
    const size = 20;
    ctx.fillStyle = '#ef4444'; // Tailwind's red-500
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

  const getResizeHandles = (box) => {
    return {
      topLeft: { x: box.x, y: box.y },
      topRight: { x: box.x + box.width, y: box.y },
      bottomLeft: { x: box.x, y: box.y + box.height },
      bottomRight: { x: box.x + box.width, y: box.y + box.height },
    };
  };

  const getDeleteButtonCoords = (box) => {
      return { x: box.x + box.width, y: box.y };
  };

  const checkInteractionType = (x, y) => {
    // Check for interaction with the currently selected box first
    if (selectedBox !== null) {
      const box = boxes[selectedBox];
      const handleSize = 10;
      
      // Check delete button
      const delBtn = getDeleteButtonCoords(box);
      if (Math.abs(x - delBtn.x) < handleSize && Math.abs(y - delBtn.y) < handleSize) {
        return { type: 'delete' };
      }
      
      // Check resize handles
      const handles = getResizeHandles(box);
      for (const [handleName, pos] of Object.entries(handles)) {
        if (Math.abs(x - pos.x) < handleSize && Math.abs(y - pos.y) < handleSize) {
          return { type: 'resizing', handle: handleName };
        }
      }
    }

    // Check if clicking inside any existing box to select/move it
    const clickedBoxIndex = boxes.findIndex(b => 
      x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
    );
    if (clickedBoxIndex !== -1) {
      return { type: 'moving', boxIndex: clickedBoxIndex };
    }

    // If no other interaction, start drawing a new box
    return { type: 'drawing' };
  };


  // --- Effects ---

  // Effect to load the image and set up canvas dimensions
  useEffect(() => {
    if (isOpen && imageUrl) {
      const imageCanvas = imageCanvasRef.current;
      const annotationCanvas = annotationCanvasRef.current;
      const ctx = imageCanvas.getContext('2d');

      // Load the image once
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        imageRef.current = image;
        // Set both canvases to image size
        imageCanvas.width = image.width;
        imageCanvas.height = image.height;
        annotationCanvas.width = image.width;
        annotationCanvas.height = image.height;
        
        // Draw image on base canvas
        ctx.drawImage(image, 0, 0);
        // Draw existing boxes
        drawBoxes();
      };
    }
  }, [isOpen, imageUrl]);

  // THE CORE FIX: A single effect to handle all drawing based on state
  useEffect(() => {
    if (!isOpen || !annotationCanvasRef.current) return;
    const canvas = annotationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all committed boxes
    boxes.forEach((box, index) => {
      const isSelected = selectedBox === index;
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      if (isSelected) {
        drawResizeHandles(ctx, box);
        drawDeleteButton(ctx, box);
      }
    });

    // Draw the temporary box being created
    if (currentDrawingBox) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentDrawingBox.x, currentDrawingBox.y, currentDrawingBox.width, currentDrawingBox.height);
    }
  }, [boxes, selectedBox, currentDrawingBox, isOpen]); // Redraw whenever state changes


  // --- Event Handlers ---

  const handleMouseDown = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    setStartPoint({ x, y });

    const interactionResult = checkInteractionType(x, y);

    if (interactionResult.type === 'delete') {
      setBoxes(boxes.filter((_, i) => i !== selectedBox));
      setSelectedBox(null);
      setInteraction({ type: 'none' });
      return;
    }
    
    if (interactionResult.type === 'moving') {
        setSelectedBox(interactionResult.boxIndex);
    } else {
        setSelectedBox(null);
    }
    
    if (interactionResult.type === 'drawing') {
        setSelectedBox(null);
    }

    setInteraction(interactionResult);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const dx = x - startPoint.x;
    const dy = y - startPoint.y;

    // Update cursor style
    const canvas = annotationCanvasRef.current;
    if (canvas) {
        const interactionCheck = checkInteractionType(x, y);
        if (interactionCheck.type === 'resizing') {
            canvas.style.cursor = 'crosshair'; // Specific resize cursors can be added
        } else if (interactionCheck.type === 'moving' || (selectedBox !== null && interactionCheck.type !== 'drawing')) {
            canvas.style.cursor = 'move';
        } else if (interactionCheck.type === 'delete') {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'crosshair';
        }
    }

    switch (interaction.type) {
      case 'drawing': {
        setCurrentDrawingBox({ x: startPoint.x, y: startPoint.y, width: dx, height: dy });
        break;
      }
      case 'moving': {
        const newBoxes = [...boxes];
        const movedBox = { ...newBoxes[interaction.boxIndex] };
        movedBox.x += dx;
        movedBox.y += dy;
        newBoxes[interaction.boxIndex] = movedBox;
        setBoxes(newBoxes);
        setStartPoint({ x, y }); // Update start point for smooth dragging
        break;
      }
      case 'resizing': {
        const newBoxes = [...boxes];
        const box = { ...newBoxes[selectedBox] };
        const { handle } = interaction;
        
        if (handle.includes('Left')) {
          box.x = x;
          box.width -= dx;
        }
        if (handle.includes('Right')) {
          box.width = x - box.x;
        }
        if (handle.includes('Top')) {
          box.y = y;
          box.height -= dy;
        }
        if (handle.includes('Bottom')) {
          box.height = y - box.y;
        }
        
        newBoxes[selectedBox] = box;
        setBoxes(newBoxes);
        setStartPoint({ x, y }); // Update for smooth resizing
        break;
      }
      default:
        break;
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    if (interaction.type === 'drawing' && currentDrawingBox) {
      // Normalize box dimensions (handle drawing in any direction)
      const newBox = {
        x: currentDrawingBox.width < 0 ? currentDrawingBox.x + currentDrawingBox.width : currentDrawingBox.x,
        y: currentDrawingBox.height < 0 ? currentDrawingBox.y + currentDrawingBox.height : currentDrawingBox.y,
        width: Math.abs(currentDrawingBox.width),
        height: Math.abs(currentDrawingBox.height),
      };
      if (newBox.width > 5 && newBox.height > 5) {
        setBoxes([...boxes, newBox]);
        setSelectedBox(boxes.length);
      }
    } else if (interaction.type === 'resizing' || interaction.type === 'moving') {
        const newBoxes = boxes.map(box => ({
            ...box,
            width: Math.abs(box.width),
            height: Math.abs(box.height),
            x: box.width < 0 ? box.x + box.width : box.x,
            y: box.height < 0 ? box.y + box.height : box.y,
        }));
        setBoxes(newBoxes);
    }
    
    // Reset interaction state
    setInteraction({ type: 'none' });
    setCurrentDrawingBox(null);
  };
  
  const clearCanvas = () => {
    setBoxes([]);
    setSelectedBox(null);
  };

  const saveAnnotations = () => {
    console.log('Final Box coordinates:', boxes);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 w-[90vw] max-w-[1200px] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Image Annotation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-3xl font-light">&times;</button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Click and drag to draw. Click a box to select, move, resize, or delete.
          </div>
          <button
            onClick={clearCanvas}
            className="px-4 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm font-medium"
          >
            Clear All
          </button>
        </div>

        <div className="overflow-auto flex-grow flex items-center justify-center bg-gray-100 rounded-md" 
             style={{ height: 'calc(85vh - 120px)' }}>  {/* Subtract header and footer height */}
          <div className="relative" style={{ width: 'fit-content' }}>
            <canvas ref={imageCanvasRef} className="block rounded-md shadow-md" />
            <canvas
              ref={annotationCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseOut={handleMouseUp} // End drawing if mouse leaves canvas
              className="absolute top-0 left-0"
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
            onClick={saveAnnotations}
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
