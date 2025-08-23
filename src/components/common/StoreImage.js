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
 * @param {boolean} [props.showDebug=false] - Whether to show debug info
 * @returns {JSX.Element} - The store image component
 */
const StoreImage = ({ 
  storeName, 
  size = "medium", 
  className = "",
  showName = false,
  showDebug = false
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
  
  // Simplified image loading approach - fewer paths, more reliable
  useEffect(() => {
    if (!storeData) return;
    
    setImageLoaded(false);
    setImageError(false);
    
    // Check if we're in GitHub Pages environment
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    // Use the appropriate path based on environment
    const primaryPath = isGitHubPages 
      ? `/receipt-image-generator/images/stores/${storeName}.png`
      : `/images/stores/${storeName}.png`;
    
    // Set the source immediately for a quick first attempt
    setImageSrc(primaryPath);
    
    // Try to load the image
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setDebugInfo(`Loaded from: ${primaryPath}`);
    };
    img.onerror = () => {
      // If the first attempt fails, try the alternate path
      const alternatePath = isGitHubPages
        ? `/images/stores/${storeName}.png` // Try without prefix
        : `/receipt-image-generator/images/stores/${storeName}.png`; // Try with prefix
        
      const altImg = new Image();
      altImg.onload = () => {
        setImageSrc(alternatePath);
        setImageLoaded(true);
        setDebugInfo(`Loaded from alternate: ${alternatePath}`);
      };
      altImg.onerror = () => {
        setImageError(true);
        setDebugInfo(`Failed to load image for: ${storeName}`);
      };
      altImg.src = alternatePath;
    };
    img.src = primaryPath;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [storeData, storeName]);
  
  if (!storeData) return null;
  
  // Only show debug info when explicitly requested
  const shouldShowDebug = showDebug || window.location.search.includes('debug=true');
  
  return (
    <div className={`store-image-container flex flex-col items-center justify-center ${className}`}>
      {!imageError && (
        <img
          data-testid='storeImage'
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
      
      {shouldShowDebug && debugInfo && (
        <div className="text-xs text-gray-500 mt-1 italic">
          {debugInfo}
        </div>
      )}
    </div>
  );
};

// Add diagnostic function to global window for debugging in production
if (typeof window !== 'undefined') {
  window.testStorePaths = (storeName) => {
    const paths = [
      `/receipt-image-generator/images/stores/${storeName}.png`,
      `/images/stores/${storeName}.png`,
      `./images/stores/${storeName}.png`,
      `images/stores/${storeName}.png`,
    ];
    
    console.log('Testing paths for store:', storeName);
    
    paths.forEach(path => {
      const img = new Image();
      img.onload = () => console.log(`✅ SUCCESS: ${path}`);
      img.onerror = () => console.log(`❌ FAILED: ${path}`);
      img.src = path;
    });
    
    return 'Check console for results...';
  };
}

export default StoreImage; 