/**
 * Coordinate Transformation Utilities
 * 
 * Handles conversion between:
 * - Absolute Pixels (API/Database format)
 * - Relative Percentages (Frontend UI format)
 */

/**
 * Convert absolute pixel coordinates to relative percentages
 * Used for displaying bounding boxes on responsive canvas
 * 
 * @param {number} x - X coordinate in pixels
 * @param {number} y - Y coordinate in pixels
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @param {number} originalWidth - Original image width from API
 * @param {number} originalHeight - Original image height from API
 * @returns {Object} { left, top, width, height } in percentages
 */
export const pixelsToPercentage = (x, y, width, height, originalWidth, originalHeight) => {
  return {
    left: (x / originalWidth) * 100,
    top: (y / originalHeight) * 100,
    width: (width / originalWidth) * 100,
    height: (height / originalHeight) * 100
  };
};

/**
 * Convert relative percentages to absolute pixel coordinates
 * Used for sending data to API
 * 
 * @param {number} left - Left position in percentage
 * @param {number} top - Top position in percentage
 * @param {number} width - Width in percentage
 * @param {number} height - Height in percentage
 * @param {number} originalWidth - Original image width from API
 * @param {number} originalHeight - Original image height from API
 * @returns {Object} { x, y, width, height } in pixels (rounded)
 */
export const percentageToPixels = (left, top, width, height, originalWidth, originalHeight) => {
  return {
    x: Math.round((left / 100) * originalWidth),
    y: Math.round((top / 100) * originalHeight),
    width: Math.round((width / 100) * originalWidth),
    height: Math.round((height / 100) * originalHeight)
  };
};

/**
 * Calculate scale factor between original and rendered image
 * Used for mouse coordinate conversion
 * 
 * @param {number} originalWidth - Original image width from API
 * @param {number} originalHeight - Original image height from API
 * @param {number} renderedWidth - Current DOM image width
 * @param {number} renderedHeight - Current DOM image height
 * @returns {Object} { scaleX, scaleY }
 */
export const calculateScaleFactor = (originalWidth, originalHeight, renderedWidth, renderedHeight) => {
  return {
    scaleX: originalWidth / renderedWidth,
    scaleY: originalHeight / renderedHeight
  };
};

/**
 * Convert mouse event coordinates to image-relative coordinates
 * Takes into account image positioning and scale
 * 
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLElement} imageElement - The image element
 * @returns {Object} { x, y } relative to image top-left corner
 */
export const getImageRelativeCoordinates = (event, imageElement) => {
  const rect = imageElement.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};

/**
 * Convert screen coordinates to API pixel coordinates
 * 
 * @param {number} screenX - X coordinate relative to rendered image
 * @param {number} screenY - Y coordinate relative to rendered image
 * @param {number} originalWidth - Original image width from API
 * @param {number} originalHeight - Original image height from API
 * @param {number} renderedWidth - Current DOM image width
 * @param {number} renderedHeight - Current DOM image height
 * @returns {Object} { x, y } in absolute pixels
 */
export const screenToApiCoordinates = (screenX, screenY, originalWidth, originalHeight, renderedWidth, renderedHeight) => {
  const { scaleX, scaleY } = calculateScaleFactor(originalWidth, originalHeight, renderedWidth, renderedHeight);
  return {
    x: Math.round(screenX * scaleX),
    y: Math.round(screenY * scaleY)
  };
};

/**
 * Normalize bounding box coordinates (ensure positive width/height)
 * Handles cases where user drags from bottom-right to top-left
 * 
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @param {number} endX - Ending X coordinate
 * @param {number} endY - Ending Y coordinate
 * @returns {Object} { x, y, width, height } with positive dimensions
 */
export const normalizeBoundingBox = (startX, startY, endX, endY) => {
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  return { x, y, width, height };
};

/**
 * Check if a point is inside a bounding box
 * 
 * @param {number} pointX - X coordinate of point
 * @param {number} pointY - Y coordinate of point
 * @param {Object} box - Bounding box { x, y, width, height }
 * @returns {boolean} True if point is inside box
 */
export const isPointInBox = (pointX, pointY, box) => {
  return (
    pointX >= box.x &&
    pointX <= box.x + box.width &&
    pointY >= box.y &&
    pointY <= box.y + box.height
  );
};

/**
 * Get color based on annotation status
 * 
 * @param {string} status - Annotation status
 * @returns {string} CSS color value
 */
export const getAnnotationColor = (status) => {
  const colors = {
    UNVERIFIED: '#FCD34D',  // Yellow - AI detection needs review
    CONFIRMED: '#34D399',   // Green - Verified correct
    ADDED: '#60A5FA',       // Blue - Human added
    EDITED: '#FB923C',      // Orange - AI detection modified
    DELETED: '#EF4444'      // Red - Marked as false positive (soft deleted)
  };
  
  return colors[status] || colors.UNVERIFIED;
};

/**
 * Get status label for display
 * 
 * @param {string} status - Annotation status
 * @returns {string} Human-readable label
 */
export const getStatusLabel = (status) => {
  const labels = {
    UNVERIFIED: 'AI Detection',
    CONFIRMED: 'Verified',
    ADDED: 'Manual',
    EDITED: 'Modified',
    DELETED: 'Deleted'
  };
  
  return labels[status] || 'Unknown';
};

/**
 * Validate bounding box dimensions
 * Ensures box is not too small or out of bounds
 * 
 * @param {Object} box - Bounding box { x, y, width, height }
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @param {number} minSize - Minimum box dimension (default: 10px)
 * @returns {boolean} True if box is valid
 */
export const isValidBoundingBox = (box, imageWidth, imageHeight, minSize = 10) => {
  return (
    box.width >= minSize &&
    box.height >= minSize &&
    box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= imageWidth &&
    box.y + box.height <= imageHeight
  );
};
