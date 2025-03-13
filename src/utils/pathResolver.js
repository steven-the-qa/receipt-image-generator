/**
 * Resolves asset paths correctly across environments
 */
export const resolveAssetPath = (path) => {
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // In development, the base URL might be different than in production
  const isProd = process.env.NODE_ENV === 'production';
  
  // You might need to adjust these based on your specific deployment
  const prodBasePath = ''; // Update if your production assets are in a subdirectory
  const devBasePath = ''; // Update if your dev assets are in a different location
  
  const basePath = isProd ? prodBasePath : devBasePath;
  
  return `${basePath}/${normalizedPath}`;
}; 