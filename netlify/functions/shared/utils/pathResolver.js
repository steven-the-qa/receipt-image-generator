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
  
  // Check production in multiple ways (GitHub Pages detection is most reliable)
  const isGitHubPages = window.location.hostname.includes('github.io');
  const isDeployEnv = process.env.REACT_APP_DEPLOY === 'true';
  const isProductionBuild = process.env.NODE_ENV === 'production';
  
  const isProduction = isGitHubPages || isDeployEnv || isProductionBuild;
  
  // In GitHub Pages, we need to include the repo name in the path
  const basePath = isProduction ? '/receipt-image-generator' : '';
  
  // Log path info in console in production mode to help debug
  if (isProduction) {
    console.debug(`[PathResolver] 
      Original path: ${path}
      Normalized: ${normalizedPath}
      isGitHubPages: ${isGitHubPages}
      isProductionBuild: ${isProductionBuild}
      isDeployEnv: ${isDeployEnv}
      Base path: ${basePath}
      Final path: ${basePath}/${normalizedPath}
    `);
  }
  
  return `${basePath}/${normalizedPath}`;
}; 