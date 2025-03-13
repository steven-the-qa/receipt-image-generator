/**
 * Resolves asset paths correctly across environments
 */
export const resolveAssetPath = (path) => {
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Check if we're in production (GitHub Pages) or development
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  // Base path depends on environment
  const basePath = isGitHubPages ? '/receipt-image-generator' : '';
  
  return `${basePath}/${normalizedPath}`;
}; 