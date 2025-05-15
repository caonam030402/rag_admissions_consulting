/**
 * Color validation utility functions
 */

/**
 * Validates if a string is a valid hex color code
 * @param color The color string to validate
 * @returns boolean indicating if the color is a valid hex code
 */
export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}; 