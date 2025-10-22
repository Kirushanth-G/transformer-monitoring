import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import UserIdModal from './UserIdModal';

const LABEL_OPTIONS = [
  'Loose Joint (Faulty)',
  'Loose Joint (Potential)',
  'Point Overload (Faulty)',
  'Point Overload (Potential)',
  'Full Wire Overload'
];

/**
 * AnnotateImageModal (finalized)
 *
 * Canvas-based annotation modal (keeps original canvas approach).
 * - Preserves guide texts & color codings
 * - Permanent right-side details panel for selected box
 * - Resize handles + arrow hints drawn on selected box
 * - Drag to draw, click to select, drag handles to resize, drag inside to move
 * - Delete button (red circle) to mark deleted
 *
 * Props:
 *  - isOpen, onClose, onSave, thermalAnalysisResult, currentUserId, transformerId, imageId
 */
function AnnotateImageModal({
  isOpen,
  onClose,
  onSave,
  thermalAnalysisResult,
  currentUserId = "unknown-user",
  transformerId,
  imageId,
}) {
  const { maintenanceImageUrl: imageUrl, detections: initialAnnotations = [] } =
    thermalAnalysisResult || {};

  const imageCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);
  const imageRef = useRef(null);

  const [boxes, setBoxes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [interaction, setInteraction] = useState({ type: "none" });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentDrawingBox, setCurrentDrawingBox] = useState(null);
  const [annotationHistory, setAnnotationHistory] = useState([]);
  const [showUserIdModal, setShowUserIdModal] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState(null);

  // Helper to create metadata entry
  const createAnnotationMetadata = (action, annotationData = {}, comment = "") => ({
    id: uuidv4(),
    userId: currentUserId,
    timestamp: new Date().toISOString(),
    imageId,
    transformerId,
    action, // 'added', 'edited', 'deleted', 'ai-detected', etc.
    comment,
    ...annotationData,
  });

  // Log action (keeps history for Save)
  const logAnnotationAction = (action, annotationData = {}, comment = "") => {
    const entry = createAnnotationMetadata(action, annotationData, comment);
    setAnnotationHistory((p) => [...p, entry]);
  };

  // Utility: get canvas coords, translated to canvas pixel space
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

  // Resize handle positions for a box
  const getResizeHandles = (box) => ({
    topLeft: { x: box.x, y: box.y },
    topRight: { x: box.x + box.width, y: box.y },
    bottomLeft: { x: box.x, y: box.y + box.height },
    bottomRight: { x: box.x + box.width, y: box.y + box.height },
    top: { x: box.x + box.width / 2, y: box.y },
    bottom: { x: box.x + box.width / 2, y: box.y + box.height },
    left: { x: box.x, y: box.y + box.height / 2 },
    right: { x: box.x + box.width, y: box.y + box.height / 2 },
  });

  const getDeleteButtonCoords = (box) => ({ x: box.x + box.width + 16, y: box.y - 16 });


  // Draw resize handles (squares) and arrow glyphs on them
  const drawResizeHandles = (ctx, box) => {
    // const handleSize = 10;
    ctx.save();
    // ctx.fillStyle = "#3b82f6"; // blue for selected handles
    const handles = getResizeHandles(box);
    // Object.values(handles).forEach((pos) => {
    //   ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
    // });

    // draw tiny arrow glyphs over mid handles to indicate direction
    // ctx.fillStyle = "white";
    ctx.font = "8px times";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // ctx.fillText("↕", handles.top.x, handles.top.y); // top
    // ctx.fillText("↕", handles.bottom.x, handles.bottom.y); // bottom
    // ctx.fillText("↔", handles.left.x, handles.left.y); // left
    // ctx.fillText("↔", handles.right.x, handles.right.y); // right
    ctx.restore();
  };

  // Draw delete circle button (red) at top-right outside box
  const drawDeleteButton = (ctx, box) => {
    const { x, y } = getDeleteButtonCoords(box);
    const size = 22;
    ctx.save();
    ctx.fillStyle = "#ffff"; // red-500
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "red";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("X", x, y + 1);
    ctx.restore();
  };

  // Determine what the pointer is over: resize handle, delete btn, box interior or empty
  const getInteractionType = (x, y) => {
    const selected = boxes.find((b) => b.id === selectedBoxId);
    if (selected && selected.status !== "deleted") {
      const del = getDeleteButtonCoords(selected);
      const distToDel = Math.hypot(x - del.x, y - del.y);
      if (distToDel < 14) return { type: "delete", cursor: "pointer" };

      const handleSize = 12;
      const handles = getResizeHandles(selected);
      for (const [name, pos] of Object.entries(handles)) {
        if (Math.abs(x - pos.x) <= handleSize / 2 && Math.abs(y - pos.y) <= handleSize / 2) {
          // map handle name to cursor and resizing handle code
          if (name === "topLeft" || name === "bottomRight")
            return { type: "resizing", handle: name, cursor: "nwse-resize" };
          if (name === "topRight" || name === "bottomLeft")
            return { type: "resizing", handle: name, cursor: "nesw-resize" };
          if (name === "top" || name === "bottom") return { type: "resizing", handle: name, cursor: "ns-resize" };
          if (name === "left" || name === "right") return { type: "resizing", handle: name, cursor: "ew-resize" };
        }
      }
    }

    // if clicking inside any non-deleted box -> moving
    const clickedBox = boxes.find(
      (b) => b.status !== "deleted" && x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
    );
    if (clickedBox) return { type: "moving", boxId: clickedBox.id, cursor: "move" };

    // otherwise drawing
    return { type: "drawing", cursor: "crosshair" };
  };

  // Load image and initialize canvases and boxes when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (!imageUrl) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    image.onload = () => {
      imageRef.current = image;
      const imgCanvas = imageCanvasRef.current;
      const annCanvas = annotationCanvasRef.current;
      if (!imgCanvas || !annCanvas) return;

      // Calculate size to fit within available space (70vh height max)
      const maxHeight = window.innerHeight * 0.7;
      const maxWidth = window.innerWidth * 0.65; // Leave space for details
      const scale = Math.min(
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight
      );

      // Set canvas sizes
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      
      imgCanvas.width = image.naturalWidth;
      imgCanvas.height = image.naturalHeight;
      annCanvas.width = image.naturalWidth;
      annCanvas.height = image.naturalHeight;

      // Set display size
      imgCanvas.style.width = `${width}px`;
      imgCanvas.style.height = `${height}px`;
      annCanvas.style.width = `${width}px`;
      annCanvas.style.height = `${height}px`;

      // draw the image
      const ctx = imgCanvas.getContext("2d");
      ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
      ctx.drawImage(image, 0, 0);

      // format initial annotations (AI detections)
      const aiTimestamp = thermalAnalysisResult?.analysisTimestamp || new Date().toISOString();
      const aiUser = thermalAnalysisResult?.createdBy || "AI";
      const formatted = (initialAnnotations || []).map((anno) => {
        return {
          ...anno,
          id: anno.id || uuidv4(),
          status: "ai-detected",
          originalDetection: true,
          createdAt: anno.createdAt || aiTimestamp,
          createdBy: anno.createdBy || aiUser,
          updatedAt: anno.updatedAt || aiTimestamp,
          updatedBy: anno.updatedBy || aiUser,
          metadata: {
            ...createAnnotationMetadata("ai-detected", anno),
            timestamp: aiTimestamp,
            userId: aiUser,
          },
        };
      });
      setBoxes(formatted);
      setSelectedBoxId(null);
      setAnnotationHistory([]);
    };
    image.onerror = () => {
      console.error("Failed to load annotation image:", imageUrl);
    };

    // cleanup when modal closed
    return () => {
      // optionally keep boxes; but reset selection and interactions
      setInteraction({ type: "none" });
      setCurrentDrawingBox(null);
      setSelectedBoxId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, imageUrl]);

  // Core drawing loop for annotation canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw boxes
    boxes.forEach((box) => {
      if (box.status === "deleted") return;
      const isSelected = box.id === selectedBoxId;
      // draw border
      if (isSelected) {
        ctx.strokeStyle = "#1a5dc8ff";
        ctx.lineWidth = 3;
      } else if (box.status === "user-added") {
        ctx.strokeStyle = "#289305ff";
        ctx.lineWidth = 3;
      } else if (box.status === "user-edited") {
        ctx.strokeStyle = "#7e37c1ff";
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = "#d43216ff";
        ctx.lineWidth = 3;
      }
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // draw label above the box border (skip placeholder "user")
      if (box.label && box.label !== "user") {
        ctx.save();
        ctx.font = "12px sans-serif";
        const padX = 6;
        const padY = 2;
        const text = box.label;
        const textW = ctx.measureText(text).width;
        const bgW = Math.min(220, Math.max(40, textW + padX * 2));
        const bgH = 18;
        const yTop = Math.max(2, box.y - bgH - 2); // keep within canvas
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(box.x, yTop, bgW, bgH);
        ctx.fillStyle = "white";
        ctx.textBaseline = "top";
        ctx.fillText(text, box.x + padX, yTop + padY);
        ctx.restore();
      }

      if (isSelected) {
        drawResizeHandles(ctx, box);
        drawDeleteButton(ctx, box);
        // drawArrowHints(ctx, box);
      }
    });

    // draw current drawing box if present
    if (currentDrawingBox) {
      ctx.save();
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(
        currentDrawingBox.x,
        currentDrawingBox.y,
        currentDrawingBox.width,
        currentDrawingBox.height
      );
      ctx.restore();
    }
  }, [boxes, selectedBoxId, currentDrawingBox, isOpen]);

  // Mouse down - decide interaction
  const handleMouseDown = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    setStartPoint({ x, y });

    const interactionResult = getInteractionType(x, y);

    // delete instantly if delete clicked
    if (interactionResult.type === "delete") {
      const toDelete = boxes.find((b) => b.id === selectedBoxId);
      if (toDelete) {
        const updated = boxes.map((b) =>
          b.id === selectedBoxId
            ? {
                ...b,
                status: "deleted",
                updatedAt: new Date().toISOString(),
                updatedBy: currentUserId,
                metadata: createAnnotationMetadata("deleted", b),
              }
            : b
        );
        setBoxes(updated);
        logAnnotationAction("deleted", toDelete);
        setSelectedBoxId(null);
      }
      setInteraction({ type: "none" });
      return;
    }

    if (interactionResult.type === "moving") {
      setSelectedBoxId(interactionResult.boxId);
      setInteraction(interactionResult);
    } else if (interactionResult.type === "resizing") {
      setInteraction(interactionResult);
    } else {
      // drawing
      setSelectedBoxId(null);
      setInteraction(interactionResult);
      setCurrentDrawingBox({ x, y, width: 0, height: 0 });
    }
  };

  // Mouse move - update drawing/moving/resizing
  const handleMouseMove = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const canvas = annotationCanvasRef.current;
    if (canvas) {
      const cursor = getInteractionType(x, y).cursor || "default";
      canvas.style.cursor = cursor;
    }

    if (interaction.type === "none") return;

    const dx = x - startPoint.x;
    const dy = y - startPoint.y;

    if (interaction.type === "drawing") {
      // handle negative drag by normalizing
      const box = {
        x: dx < 0 ? startPoint.x + dx : startPoint.x,
        y: dy < 0 ? startPoint.y + dy : startPoint.y,
        width: Math.abs(dx),
        height: Math.abs(dy),
      };
      setCurrentDrawingBox(box);
      return;
    }

    if (interaction.type === "moving") {
      setBoxes((prev) =>
        prev.map((b) => {
          if (b.id !== interaction.boxId) return b;
          const moved = {
            ...b,
            x: b.x + dx,
            y: b.y + dy,
            status: b.status === "ai-detected" ? "user-edited" : b.status,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUserId,
            metadata: b.status === "ai-detected" ? createAnnotationMetadata("edited", b) : b.metadata,
          };
          return moved;
        })
      );
      setStartPoint({ x, y });
      return;
    }

    if (interaction.type === "resizing") {
      const handle = interaction.handle;
      setBoxes((prev) =>
        prev.map((b) => {
          if (b.id !== selectedBoxId) return b;
          const newBox = { ...b };
          // handle names are topLeft, topRight, bottomLeft, bottomRight, top, bottom, left, right
          if (handle === "topLeft") {
            newBox.x += dx;
            newBox.y += dy;
            newBox.width -= dx;
            newBox.height -= dy;
          } else if (handle === "topRight") {
            newBox.y += dy;
            newBox.width += dx;
            newBox.height -= dy;
          } else if (handle === "bottomLeft") {
            newBox.x += dx;
            newBox.width -= dx;
            newBox.height += dy;
          } else if (handle === "bottomRight") {
            newBox.width += dx;
            newBox.height += dy;
          } else if (handle === "top") {
            newBox.y += dy;
            newBox.height -= dy;
          } else if (handle === "bottom") {
            newBox.height += dy;
          } else if (handle === "left") {
            newBox.x += dx;
            newBox.width -= dx;
          } else if (handle === "right") {
            newBox.width += dx;
          }
          // normalize negative dims when drawing done (we'll do on mouseup) but ensure not negative width/height while resizing
          return {
            ...newBox,
            status: newBox.status === "ai-detected" ? "user-edited" : newBox.status,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUserId,
            metadata: newBox.status === "ai-detected" ? createAnnotationMetadata("edited", newBox) : newBox.metadata,
          };
        })
      );
      setStartPoint({ x, y });
      return;
    }
  };

  // Mouse up - finalize drawing/resizing/moving
  const handleMouseUp = (e) => {
    e.preventDefault();
    const canvas = annotationCanvasRef.current;
    if (canvas) canvas.style.cursor = "default";

    if (interaction.type === "drawing" && currentDrawingBox) {
      const normalized = {
        x: currentDrawingBox.width < 0 ? currentDrawingBox.x + currentDrawingBox.width : currentDrawingBox.x,
        y: currentDrawingBox.height < 0 ? currentDrawingBox.y + currentDrawingBox.height : currentDrawingBox.y,
        width: Math.abs(currentDrawingBox.width),
        height: Math.abs(currentDrawingBox.height),
      };
      if (normalized.width > 5 && normalized.height > 5) {
        const now = new Date().toISOString();
        const newBox = {
          ...normalized,
          id: uuidv4(),
          status: "user-added",
          label: "User",
          createdAt: now,
          createdBy: currentUserId,
          updatedAt: now,
          updatedBy: currentUserId,
          metadata: createAnnotationMetadata("added", normalized),
        };
        setBoxes((p) => [...p, newBox]);
        logAnnotationAction("added", newBox);
        setSelectedBoxId(newBox.id);
      }
      setCurrentDrawingBox(null);
    }

    if (interaction.type === "resizing") {
      // normalize any negative widths/heights on the edited box
      setBoxes((prev) =>
        prev.map((b) => {
          if (b.id !== selectedBoxId) return b;
          const nb = { ...b };
          if (nb.width < 0) {
            nb.x = nb.x + nb.width;
            nb.width = Math.abs(nb.width);
          }
          if (nb.height < 0) {
            nb.y = nb.y + nb.height;
            nb.height = Math.abs(nb.height);
          }
          logAnnotationAction("edited", nb);
          return nb;
        })
      );
    }

    if (interaction.type === "moving") {
      const moved = boxes.find((b) => b.id === interaction.boxId);
      if (moved) logAnnotationAction("edited", moved);
    }

    setInteraction({ type: "none" });
    setStartPoint({ x: 0, y: 0 });
  };

  // Clear and reset to original AI detections
  const handleResetToAi = () => {
    const aiTimestamp = thermalAnalysisResult?.analysisTimestamp || new Date().toISOString();
    const aiUser = thermalAnalysisResult?.createdBy || "AI";
    const formatted = (initialAnnotations || []).map((anno) => {
      return {
        ...anno,
        id: anno.id || uuidv4(),
        status: "ai-detected",
        originalDetection: true,
        createdAt: anno.createdAt || aiTimestamp,
        createdBy: anno.createdBy || aiUser,
        updatedAt: anno.updatedAt || aiTimestamp,
        updatedBy: anno.updatedBy || aiUser,
        metadata: {
          ...createAnnotationMetadata("ai-detected", anno),
          timestamp: aiTimestamp,
          userId: aiUser,
        },
      };
    });
    setBoxes(formatted);
    // Always auto-select the first restored annotation
    setSelectedBoxId(null);
    // Clear any ongoing interactions/drawing
    setInteraction({ type: "none" });
    setCurrentDrawingBox(null);
    setStartPoint({ x: 0, y: 0 });

    logAnnotationAction("reset", { message: "Reset to AI detections" });
  };

  // Delete currently selected box
  const deleteSelectedBox = (id) => {
    const toDelete = boxes.find((b) => b.id === id);
    if (!toDelete) return;
    setBoxes((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "deleted",
              updatedAt: new Date().toISOString(),
              updatedBy: currentUserId,
              metadata: createAnnotationMetadata("deleted", b),
            }
          : b
      )
    );
    logAnnotationAction("deleted", toDelete);
    setSelectedBoxId(null);
  };

  // Modify handleSave to show user ID modal first
  const handleSave = () => {
    // Format boxes for saving, ensuring all required fields are present
    const formattedBoxes = boxes.map(box => ({
      id: box.id,
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      label: box.label || null,
      status: box.status,
      createdAt: box.createdAt,
      createdBy: box.createdBy,
      updatedAt: box.updatedAt,
      updatedBy: box.updatedBy,
      confidence: box.confidence || null,
      metadata: box.metadata
    }));

    const feedback = {
      annotations: formattedBoxes, // All annotations including modified ones
      added: formattedBoxes.filter(b => b.status === "user-added"),
      edited: formattedBoxes.filter(b => b.status === "user-edited"),
      deleted: formattedBoxes.filter(b => b.status === "deleted"),
      originalDetections: initialAnnotations,
      unchangedAiDetections: formattedBoxes.filter(b => b.status === "ai-detected"),
      history: annotationHistory,
      metadata: {
        userId: currentUserId,
        timestamp: new Date().toISOString(),
        imageId,
        transformerId,
        totalAnnotations: formattedBoxes.filter(b => b.status !== "deleted").length,
        userModifications: formattedBoxes.filter(b => b.status !== "ai-detected").length,
      }
    };

    setPendingFeedback(feedback);
    setShowUserIdModal(true);
  };

  // Modify handleUserIdSubmit to ensure the feedback includes the userId
  const handleUserIdSubmit = (userId) => {
    if (pendingFeedback && typeof onSave === "function") {
      const updatedFeedback = {
        ...pendingFeedback,
        metadata: {
          ...pendingFeedback.metadata,
          userId,
        },
        // Update all annotations with the confirmed userId
        annotations: pendingFeedback.annotations.map(anno => ({
          ...anno,
          updatedBy: userId,
          metadata: {
            ...anno.metadata,
            userId
          }
        }))
      };
      
      try {
        onSave(updatedFeedback);
      } catch (err) {
        console.error("Error saving annotations:", err);
      }
      setShowUserIdModal(false);
      setPendingFeedback(null);
      onClose();
    }
  };

  const handleLabelChange = (id, newLabel) => {
    setBoxes(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        const updated = {
          ...b,
          label: newLabel || null,
          status: b.status === "ai-detected" ? "user-edited" : b.status,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUserId,
          metadata: createAnnotationMetadata("edited", { ...b, label: newLabel || null }),
        };
        return updated;
      })
    );
    const changed = boxes.find(b => b.id === id);
    logAnnotationAction("edited", { ...(changed || {}), label: newLabel || null });
  };

  // Keyboard fine adjustments for selected box
  useEffect(() => {
    const onKey = (e) => {
      if (!selectedBoxId) return;
      const step = e.shiftKey ? 10 : 1;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        setBoxes((prev) =>
          prev.map((b) => {
            if (b.id !== selectedBoxId) return b;
            const nb = { ...b };
            if (e.key === "ArrowLeft") nb.x -= step;
            if (e.key === "ArrowRight") nb.x += step;
            if (e.key === "ArrowUp") nb.y -= step;
            if (e.key === "ArrowDown") nb.y += step;
            nb.status = nb.status === "ai-detected" ? "user-edited" : nb.status;
            nb.metadata = nb.metadata || createAnnotationMetadata("edited", nb);
            nb.updatedAt = new Date().toISOString();
            nb.updatedBy = currentUserId;
            return nb;
          })
        );
        logAnnotationAction("edited", boxes.find((b) => b.id === selectedBoxId) || {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBoxId, boxes]);

  // selectedBox reference derived from boxes
  const selectedBox = boxes.find((b) => b.id === selectedBoxId && b.status !== "deleted") || null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 w-[95vw] max-w-[1400px] max-h-[92vh] flex">
        {/* LEFT: Details Panel */}
        <div className="w-72 bg-white border-r px-4 py-3 flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Selected Annotation</h3>
          {selectedBox ? (
            <>
              <div className="text-sm text-gray-700 mb-2 space-y-2">
                <p><strong>Status:</strong> {selectedBox.status.replace("-", " ")}</p>
                <p><strong>Position:</strong> ({Math.round(selectedBox.x)}, {Math.round(selectedBox.y)})</p>
                <p><strong>Size:</strong> {Math.round(selectedBox.width)} X {Math.round(selectedBox.height)}</p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {selectedBox.createdAt ? new Date(selectedBox.createdAt).toLocaleString() : "N/A"}{" "}
                </p>
                <p>
                  <strong>Created By:</strong>{" "}
                  {selectedBox.createdBy || "N/A"}
                </p>
                <p>
                  <strong>Last Modified At:</strong>{" "}
                  {selectedBox.updatedAt ? new Date(selectedBox.updatedAt).toLocaleString() : "N/A"}{" "}
                </p>
                <p>
                  <strong>Last Modified By:</strong>{" "}
                  {selectedBox.updatedBy || "N/A"}
                </p>

                {/* Label Dropdown */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fault Type
                  </label>
                  <select
                    value={selectedBox.label === 'user' ? '' : (selectedBox.label || '')}
                    onChange={(e) => handleLabelChange(selectedBox.id, e.target.value)}
                    className="w-full px-2 py-1 border rounded-md text-sm bg-white"
                  >
                    <option value="">Select fault type...</option>
                    {LABEL_OPTIONS.map(label => (
                      <option key={label} value={label}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                Use arrow keys to move selected box. <br />
                Hold Shift + arrow for larger steps.
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400 italic">No box selected</div>
          )}

          {/* Delete at bottom of the left panel */}
          <div className="mt-auto pt-3">
            <button
              onClick={() => selectedBox && deleteSelectedBox(selectedBox.id)}
              disabled={!selectedBox}
              className={`w-full px-3 py-2 rounded-md text-sm ${selectedBox ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              Delete Annotation
            </button>
          </div>
        </div>

        {/* RIGHT: Canvas area */}
        <div className="flex-1 pl-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {/* <span>Click and drag to draw. Click a box to select.</span> */}

              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 inline-block" style={{ backgroundColor: "#d43216ff" }}></span>
                <span className="text-xs">AI Detected</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 inline-block" style={{ backgroundColor: "#7e37c1ff" }}></span>
                <span className="text-xs">User Edited</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 inline-block" style={{ backgroundColor: "#289305ff" }}></span>
                <span className="text-xs">User Added</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 inline-block" style={{ backgroundColor: "#1a5dc8ff" }}></span>
                <span className="text-xs">Selected</span>
              </div>
            </div>

            <button
              onClick={handleResetToAi}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-s font-semibold"
            >
              Reset to AI
            </button>
          </div>

          {/* Canvas container - centered, not scrollable */}
          <div className="bg-gray-100 rounded-md flex items-center justify-center">
            <div className="relative">
              <canvas ref={imageCanvasRef} className="block rounded-md shadow-md" />
              <canvas
                ref={annotationCanvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="absolute top-0 left-0"
                style={{ touchAction: "none" }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total Annotations: {boxes.filter((b) => b.status !== "deleted").length}
            </div>
            <div className="flex space-x-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add UserIdModal */}
      <UserIdModal
        isOpen={showUserIdModal}
        onClose={() => setShowUserIdModal(false)}
        onSubmit={handleUserIdSubmit}
      />
    </div>
  );
}

export default AnnotateImageModal;