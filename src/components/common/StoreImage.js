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
  const [imageSrc, setImageSrc] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  
  // Get store data from registry
  const storeData = getStoreImageData(storeName);
  
  // Define sizes for different contexts
  const sizes = {
    small: 'h-[50px]',
    medium: 'h-[100px]',
    large: 'h-[150px]'
  };
  
  // Preload the image with multiple fallback strategies
  useEffect(() => {
    if (!storeData) return;
    
    setImageLoaded(false);
    setImageError(false);
    
    // Try multiple paths - this is crucial for reliability
    const tryImagePaths = () => {
      // Paths to try in order (most likely to work first)
      const pathsToTry = [
        storeData.imagePath,                                           // Path from registry (should already be resolved)
        `/receipt-image-generator/images/stores/${storeName}.png`,     // Explicit GH Pages path
        `./images/stores/${storeName}.png`,                            // Relative path 
        `images/stores/${storeName}.png`,                              // Another relative variant
        `/images/stores/${storeName}.png`,                             // Root-relative path
      ];
      
      // Function to recursively try paths
      const tryPath = (index) => {
        if (index >= pathsToTry.length) {
          // We've tried all paths and none worked
          setImageError(true);
          setDebugInfo(`Failed all image paths for ${storeName}`);
          return;
        }
        
        const pathToTry = pathsToTry[index];
        const img = new Image();
        
        img.onload = () => {
          // Success! Use this path
          setImageSrc(pathToTry);
          setImageLoaded(true);
          setDebugInfo(`Loaded from path: ${pathToTry}`);
        };
        
        img.onerror = () => {
          // Try next path
          console.debug(`[StoreImage] Failed to load ${pathToTry}, trying next path...`);
          tryPath(index + 1);
        };
        
        img.src = pathToTry;
      };
      
      // Start with the first path
      tryPath(0);
    };
    
    tryImagePaths();
  }, [storeData, storeName]);
  
  if (!storeData) return null;
  
  // Show debug info in non-production
  const isDebug = process.env.NODE_ENV !== 'production' || window.location.search.includes('debug=true');
  
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
      
      {isDebug && debugInfo && (
        <div className="text-xs text-gray-500 mt-1 italic">
          {debugInfo}
        </div>
      )}
    </div>
  );
};

export default StoreImage; 