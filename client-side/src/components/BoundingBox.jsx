import React, { useState } from 'react';
import { getAnnotationColor, getStatusLabel } from '../utils/coordinateTransform';
import { CheckIcon, TrashIcon, EditIcon } from './ui/icons';

/**
 * BoundingBox Component
 * Renders a single bounding box with resize handles and action buttons
 */
const BoundingBox = ({
  detection,
  isSelected,
  isEditing,
  onSelect,
  onDelete,
  onConfirm,
  onStartResize,
  onStartMove
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const color = getAnnotationColor(detection.annotationStatus);
  const statusLabel = getStatusLabel(detection.annotationStatus);
  
  // Don't show deleted boxes unless specifically requested
  if (detection.annotationStatus === 'DELETED') {
    return null;
  }

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(detection.id);
    
    // Check if clicking on a resize handle
    if (e.target.classList.contains('resize-handle')) {
      const direction = e.target.dataset.direction;
      onStartResize(detection.id, direction, e);
    } else {
      // Start moving the box
      onStartMove(detection.id, e);
    }
  };

  const renderResizeHandles = () => {
    if (!isSelected || !isEditing) return null;

    const handleSize = '10px';
    const handles = [
      { direction: 'nw', cursor: 'nw-resize', top: '-5px', left: '-5px' },
      { direction: 'n', cursor: 'n-resize', top: '-5px', left: '50%', transform: 'translateX(-50%)' },
      { direction: 'ne', cursor: 'ne-resize', top: '-5px', right: '-5px' },
      { direction: 'e', cursor: 'e-resize', top: '50%', right: '-5px', transform: 'translateY(-50%)' },
      { direction: 'se', cursor: 'se-resize', bottom: '-5px', right: '-5px' },
      { direction: 's', cursor: 's-resize', bottom: '-5px', left: '50%', transform: 'translateX(-50%)' },
      { direction: 'sw', cursor: 'sw-resize', bottom: '-5px', left: '-5px' },
      { direction: 'w', cursor: 'w-resize', top: '50%', left: '-5px', transform: 'translateY(-50%)' }
    ];

    return handles.map((handle) => (
      <div
        key={handle.direction}
        className="resize-handle"
        data-direction={handle.direction}
        style={{
          position: 'absolute',
          width: handleSize,
          height: handleSize,
          backgroundColor: 'white',
          border: `2px solid ${color}`,
          borderRadius: '50%',
          cursor: handle.cursor,
          zIndex: 1002,
          ...Object.fromEntries(
            Object.entries(handle).filter(([key]) => !['direction', 'cursor'].includes(key))
          )
        }}
      />
    ));
  };

  const renderActionButtons = () => {
    if (!isHovered || !isEditing) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: '-35px',
          right: '0',
          display: 'flex',
          gap: '4px',
          zIndex: 1003
        }}
      >
        {/* Confirm Button - Only for UNVERIFIED or EDITED */}
        {(detection.annotationStatus === 'UNVERIFIED' || detection.annotationStatus === 'EDITED') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(detection.id);
            }}
            className="bg-green-500 hover:bg-green-600 text-white rounded p-1.5 shadow-lg transition-colors"
            title="Confirm Detection"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        )}

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(detection.id);
          }}
          className="bg-red-500 hover:bg-red-600 text-white rounded p-1.5 shadow-lg transition-colors"
          title="Delete Detection"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderLabel = () => {
    return (
      <div
        style={{
          position: 'absolute',
          top: '-25px',
          left: '0',
          backgroundColor: color,
          color: '#1F2937',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          zIndex: 1001,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        <div className="flex items-center gap-2">
          <span>{detection.label || 'Anomaly'}</span>
          {detection.confidence && (
            <span className="text-xs opacity-80">
              {(detection.confidence * 100).toFixed(0)}%
            </span>
          )}
          {detection.temperatureCelsius && (
            <span className="text-xs font-bold">
              {detection.temperatureCelsius}°C
            </span>
          )}
        </div>
        <div className="text-xs opacity-75">
          {statusLabel}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${detection.left}%`,
        top: `${detection.top}%`,
        width: `${detection.width}%`,
        height: `${detection.height}%`,
        border: `${isSelected ? '3' : '2'}px solid ${color}`,
        backgroundColor: isSelected ? `${color}20` : 'transparent',
        cursor: isEditing ? 'move' : 'pointer',
        boxSizing: 'border-box',
        zIndex: isSelected ? 1000 : 999,
        transition: 'all 0.1s ease'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderLabel()}
      {renderActionButtons()}
      {renderResizeHandles()}
      
      {/* Detection ID for debugging */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '0',
            fontSize: '10px',
            color: '#6B7280',
            backgroundColor: 'white',
            padding: '2px 4px',
            borderRadius: '2px',
            zIndex: 1001
          }}
        >
          ID: {detection.id}
        </div>
      )}
    </div>
  );
};

export default BoundingBox;
