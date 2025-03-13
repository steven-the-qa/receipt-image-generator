import React, { useState, useEffect } from 'react';
import { getStoreImageData } from '../../data/storeImageRegistry';

/**
 * StoreImage component - Displays a store logo with reliable fallback
 * 
 * @param {Object} props
 * @param {string} props.storeName - Store identifier key
 * @param {string} [props.size='medium'] - Size preset (small, medium, large)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.showName=false] - Whether to always show store name below logo
 * @returns {JSX.Element} - The store image component
 */
const StoreImage = ({ 
  storeName, 
  size = "medium", 
  className = "",
  showName = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Get store data from registry
  const storeData = getStoreImageData(storeName);
  
  // Define sizes for different contexts
  const sizes = {
    small: 'h-[50px]',
    medium: 'h-[100px]',
    large: 'h-[150px]'
  };
  
  // Preload the image
  useEffect(() => {
    if (!storeData) return;
    
    // Try multiple path variations
    const pathsToTry = [
      storeData.imagePath,                             // Standard path from registry
      `/${storeData.imagePath}`,                       // Add leading slash
      `${window.location.origin}/${storeData.imagePath}`, // Absolute URL
      `images/stores/${storeName}.png`,                // Relative to current path
      `/images/stores/${storeName}.png`                // Absolute from domain root
    ];
    
    // Function to try the next path
    const tryNextPath = (pathIndex) => {
      if (pathIndex >= pathsToTry.length) {
        setImageError(true);
        return;
      }
      
      const img = new Image();
      img.src = pathsToTry[pathIndex];
      
      img.onload = () => {
        // This path worked! Update the component state
        setImageSrc(pathsToTry[pathIndex]);
        setImageLoaded(true);
      };
      
      img.onerror = () => {
        // Try the next path
        tryNextPath(pathIndex + 1);
      };
    };
    
    // Start trying paths
    tryNextPath(0);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[StoreImage] Trying to load: ${storeName}`);
      console.log(`[StoreImage] Paths to try:`, pathsToTry);
    }
    
    // No cleanup needed for the recursive function
  }, [storeData, storeName]);
  
  if (!storeData) return null;
  
  return (
    <div className={`store-image-container flex flex-col items-center justify-center ${className}`}>
      {!imageError && (
        <img
          src={imageSrc}
          alt={`${storeData.displayName} logo`}
          className={`object-contain max-w-full ${sizes[size]} transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          aria-hidden={imageError}
        />
      )}
      
      {(!imageLoaded || imageError || showName) && (
        <div 
          className={`flex items-center justify-center ${imageError ? sizes[size] : 'mt-2'} p-2 rounded-md`}
          style={imageError ? { backgroundColor: `${storeData.fallbackColor}20` } : {}}
        >
          <h3 className={`text-center font-bold ${size === 'small' ? 'text-md' : 'text-xl'} tracking-tight`}>
            {storeData.displayName}
          </h3>
        </div>
      )}
      
      {process.env.NODE_ENV !== 'production' && debugInfo && (
        <div className="text-xs text-gray-400 mt-1">
          Debug: {debugInfo}
        </div>
      )}
    </div>
  );
};

export default StoreImage; 