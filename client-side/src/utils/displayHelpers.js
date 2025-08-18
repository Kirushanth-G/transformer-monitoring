/**
 * Utility function to handle null/undefined values for display
 * @param {any} value - The value to check
 * @param {string} fallback - The fallback text to display (default: "Null")
 * @returns {string} - The value or fallback text
 */
export const displayValue = (value, fallback = 'Null') => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return value;
};

/**
 * Utility function to check if a value should be styled as null
 * @param {any} value - The value to check
 * @returns {boolean} - True if value should be styled as null
 */
export const isNullValue = value => {
  return value === null || value === undefined || value === '';
};

/**
 * Utility function to get the display value for null checking
 * @param {any} value - The value to check
 * @param {string} fallback - The fallback text to display (default: "Null")
 * @returns {string} - The value or fallback text
 */
export const getDisplayValue = (value, fallback = 'Null') => {
  return displayValue(value, fallback);
};
