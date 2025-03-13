import { resolveAssetPath } from '../utils/pathResolver';

// A centralized registry mapping store keys to their image data and display information
export const storeImageRegistry = {
  "7eleven": {
    imagePath: resolveAssetPath("images/stores/7eleven.png"),
    displayName: "7-Eleven",
    fallbackColor: "#00b350" // Brand green color
  },
  "acehardware": {
    imagePath: resolveAssetPath("images/stores/acehardware.png"),
    displayName: "Ace Hardware",
    fallbackColor: "#dd0000" // Red color
  },
  "acmemarkets": {
    imagePath: resolveAssetPath("images/stores/acmemarkets.png"),
    displayName: "Acme Markets",
    fallbackColor: "#e31837" // Red color
  },
  "advancedautoparts": {
    imagePath: resolveAssetPath("images/stores/advancedautoparts.png"),
    displayName: "Advanced Auto Parts",
    fallbackColor: "#c00" // Red color
  },
  "albertsons": {
    imagePath: resolveAssetPath("images/stores/albertsons.png"),
    displayName: "Albertsons",
    fallbackColor: "#0073cf" // Blue color
  },
  "aldi": {
    imagePath: resolveAssetPath("images/stores/aldi.png"),
    displayName: "Aldi",
    fallbackColor: "#00457c" // Blue color
  },
  "arbys": {
    imagePath: resolveAssetPath("images/stores/arbys.png"),
    displayName: "Arby's",
    fallbackColor: "#e21837" // Red color
  },
  "autozone": {
    imagePath: resolveAssetPath("images/stores/autozone.png"),
    displayName: "AutoZone",
    fallbackColor: "#d52b1e" // Red color
  },
  "bestbuy": {
    imagePath: resolveAssetPath("images/stores/bestbuy.png"),
    displayName: "Best Buy",
    fallbackColor: "#0046be" // Blue color
  },
  "costco": {
    imagePath: resolveAssetPath("images/stores/costco.png"),
    displayName: "Costco",
    fallbackColor: "#005daa" // Blue color
  },
  "cvs": {
    imagePath: resolveAssetPath("images/stores/cvs.png"),
    displayName: "CVS",
    fallbackColor: "#cc0000" // Red color
  },
  "dollargeneral": {
    imagePath: resolveAssetPath("images/stores/dollargeneral.png"),
    displayName: "Dollar General",
    fallbackColor: "#ffc726" // Yellow color
  },
  "dollartree": {
    imagePath: resolveAssetPath("images/stores/dollartree.png"),
    displayName: "Dollar Tree",
    fallbackColor: "#65A637" // Green color
  },
  "target": {
    imagePath: resolveAssetPath("images/stores/target.png"),
    displayName: "Target",
    fallbackColor: "#cc0000" // Red color
  },
  "walmart": {
    imagePath: resolveAssetPath("images/stores/walmart.png"),
    displayName: "Walmart",
    fallbackColor: "#0071ce" // Blue color
  },
  "homedepot": {
    imagePath: resolveAssetPath("images/stores/homedepot.png"),
    displayName: "Home Depot",
    fallbackColor: "#f96302" // Orange color
  },
  "kroger": {
    imagePath: resolveAssetPath("images/stores/kroger.png"),
    displayName: "Kroger",
    fallbackColor: "#002d74" // Blue color
  },
  "lowes": {
    imagePath: resolveAssetPath("images/stores/lowes.png"),
    displayName: "Lowe's",
    fallbackColor: "#004990" // Blue color
  },
  "mcdonalds": {
    imagePath: resolveAssetPath("images/stores/mcdonalds.png"),
    displayName: "McDonald's",
    fallbackColor: "#ffcc00" // Yellow color
  },
  "publix": {
    imagePath: resolveAssetPath("images/stores/publix.png"),
    displayName: "Publix",
    fallbackColor: "#007a3e" // Green color
  },
  "ralphs": {
    imagePath: resolveAssetPath("images/stores/ralphs.png"),
    displayName: "Ralphs",
    fallbackColor: "#e41d34" // Red color
  },
  "safeway": {
    imagePath: resolveAssetPath("images/stores/safeway.png"),
    displayName: "Safeway",
    fallbackColor: "#e41b17" // Red color
  },
  "samsclub": {
    imagePath: resolveAssetPath("images/stores/samsclub.png"),
    displayName: "Sam's Club",
    fallbackColor: "#0060a9" // Blue color
  },
  "sonic": {
    imagePath: resolveAssetPath("images/stores/sonic.png"),
    displayName: "Sonic",
    fallbackColor: "#0066b2" // Blue color
  },
  "starbucks": {
    imagePath: resolveAssetPath("images/stores/starbucks.png"),
    displayName: "Starbucks",
    fallbackColor: "#006241" // Green color
  },
  "tacobell": {
    imagePath: resolveAssetPath("images/stores/tacobell.png"),
    displayName: "Taco Bell",
    fallbackColor: "#702082" // Purple color
  },
  "tjmaxx": {
    imagePath: resolveAssetPath("images/stores/tjmaxx.png"),
    displayName: "TJ Maxx",
    fallbackColor: "#e11a2c" // Red color
  },
  "traderjoes": {
    imagePath: resolveAssetPath("images/stores/traderjoes.png"),
    displayName: "Trader Joe's",
    fallbackColor: "#cc0000" // Red color
  },
  "winndixie": {
    imagePath: resolveAssetPath("images/stores/winndixie.png"),
    displayName: "Winn-Dixie",
    fallbackColor: "#d40000" // Red color
  }
  // Additional store entries would be added here
};

/**
 * Gets store image data and display information from the registry
 * @param {string} storeKey - The store identifier key
 * @returns {Object} Store data object with image path, display name, and fallback color
 */
export const getStoreImageData = (storeKey) => {
  if (!storeKey) return null;
  
  // Normalize the store key to match registry format (lowercase, no spaces or special chars)
  const normalizedKey = storeKey.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Return the store data from registry or generate fallback
  return storeImageRegistry[normalizedKey] || {
    imagePath: resolveAssetPath(`images/stores/${normalizedKey}.png`),
    displayName: formatStoreName(storeKey),
    fallbackColor: "#cccccc" // Default gray for unknown stores
  };
};

/**
 * Formats a store name for display when not found in registry
 * @param {string} name - The store name to format
 * @returns {string} Formatted store name
 */
function formatStoreName(name) {
  if (!name) return '';
  
  // Special cases handling
  const specialCases = {
    '7eleven': '7-Eleven',
    'cvs': 'CVS',
    'kfc': 'KFC',
    'tjmaxx': 'TJ Maxx',
    'homedepot': 'Home Depot',
    'usps': 'USPS',
  };
  
  const normalizedKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (specialCases[normalizedKey]) {
    return specialCases[normalizedKey];
  }
  
  // Default formatting: capitalize first letter and add spaces before capitals
  return name.charAt(0).toUpperCase() + 
         name.slice(1).replace(/([A-Z])/g, ' $1');
} 