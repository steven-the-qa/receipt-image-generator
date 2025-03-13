/**
 * Utility to resolve asset paths correctly across environments
 * Handles the difference between:
 * - Development: http://localhost:3000/
 * - Production: https://steven-the-qa.github.io/receipt-image-generator/
 */

/**
 * Resolves asset paths correctly for both development and production environments
 * @param {string} path - The relative path to the asset (e.g. "images/stores/walmart.png")
 * @returns {string} The correctly resolved path
 */
export const resolveAssetPath = (path) => {
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Multiple ways to detect production:
  // 1. Check for GitHub Pages hostname
  // 2. Check for deployment environment variable
  // 3. Check for production build
  const isProduction = 
    window.location.hostname.includes('github.io') || 
    process.env.REACT_APP_DEPLOY === 'true' ||
    process.env.NODE_ENV === 'production';
  
  // Base path depends on environment
  const basePath = isProduction ? '/receipt-image-generator' : '';
  
  return `${basePath}/${normalizedPath}`;
}; 