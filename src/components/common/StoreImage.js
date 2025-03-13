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
    
    // Try with both absolute and relative paths
    const img = new Image();
    img.src = storeData.imagePath; // Try absolute path first
    
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      // If absolute path fails, try relative path
      const relativeImg = new Image();
      const relativePath = storeData.imagePath.startsWith('/') 
        ? storeData.imagePath.substring(1) 
        : storeData.imagePath;
      
      relativeImg.src = relativePath;
      relativeImg.onload = () => {
        setImageLoaded(true);
        // Update the src we'll use for the visible image
        storeData.imagePath = relativePath;
      };
      relativeImg.onerror = () => setImageError(true);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [storeData]);
  
  if (!storeData) return null;
  
  return (
    <div className={`store-image-container flex flex-col items-center justify-center ${className}`}>
      {!imageError && (
        <img
          src={storeData.imagePath}
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
    </div>
  );
};

export default StoreImage; 