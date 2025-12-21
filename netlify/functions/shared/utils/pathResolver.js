/**
 * Utility to resolve asset paths correctly
 * @param {string} path - The relative path to the asset (e.g. "images/stores/walmart.png")
 * @returns {string} The correctly resolved path
 */
export const resolveAssetPath = (path) => {
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Return path with leading slash for consistency
  return `/${normalizedPath}`;
}; 