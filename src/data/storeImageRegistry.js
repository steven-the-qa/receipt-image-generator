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
  "bathbodyworks": {
    imagePath: resolveAssetPath("images/stores/bathbodyworks.png"),
    displayName: "Bath & Body Works",
    fallbackColor: "#01142d" // Navy color
  },
  "bestbuy": {
    imagePath: resolveAssetPath("images/stores/bestbuy.png"),
    displayName: "Best Buy",
    fallbackColor: "#0046be" // Blue color
  },
  "biglots": {
    imagePath: resolveAssetPath("images/stores/biglots.png"),
    displayName: "Big Lots",
    fallbackColor: "#ff5100" // Orange color
  },
  "bjs": {
    imagePath: resolveAssetPath("images/stores/bjs.png"),
    displayName: "BJ's",
    fallbackColor: "#0055a4" // Blue color
  },
  "bostonmarket": {
    imagePath: resolveAssetPath("images/stores/bostonmarket.png"),
    displayName: "Boston Market",
    fallbackColor: "#ce181e" // Red color
  },
  "bp": {
    imagePath: resolveAssetPath("images/stores/bp.png"),
    displayName: "BP",
    fallbackColor: "#009c47" // Green color
  },
  "buffalowildwings": {
    imagePath: resolveAssetPath("images/stores/buffalowildwings.png"),
    displayName: "Buffalo Wild Wings",
    fallbackColor: "#ffc72c" // Yellow color
  },
  "burgerking": {
    imagePath: resolveAssetPath("images/stores/burgerking.png"),
    displayName: "Burger King",
    fallbackColor: "#d62300" // Red color
  },
  "burlington": {
    imagePath: resolveAssetPath("images/stores/burlington.png"),
    displayName: "Burlington",
    fallbackColor: "#e51636" // Red color
  },
  "caseys": {
    imagePath: resolveAssetPath("images/stores/caseys.png"),
    displayName: "Casey's",
    fallbackColor: "#e41b17" // Red color
  },
  "chevron": {
    imagePath: resolveAssetPath("images/stores/chevron.png"),
    displayName: "Chevron",
    fallbackColor: "#0054a4" // Blue color
  },
  "chickfila": {
    imagePath: resolveAssetPath("images/stores/chickfila.png"),
    displayName: "Chick-fil-A",
    fallbackColor: "#e51636" // Red color
  },
  "chipotle": {
    imagePath: resolveAssetPath("images/stores/chipotle.png"),
    displayName: "Chipotle",
    fallbackColor: "#8d1d2c" // Dark red color
  },
  "circlek": {
    imagePath: resolveAssetPath("images/stores/circlek.png"),
    displayName: "Circle K",
    fallbackColor: "#ed1c24" // Red color
  },
  "costco": {
    imagePath: resolveAssetPath("images/stores/costco.png"),
    displayName: "Costco",
    fallbackColor: "#005daa" // Blue color
  },
  "costcofuel": {
    imagePath: resolveAssetPath("images/stores/costcofuel.png"),
    displayName: "Costco Fuel",
    fallbackColor: "#005daa" // Blue color
  },
  "crackerbarrel": {
    imagePath: resolveAssetPath("images/stores/crackerbarrel.png"),
    displayName: "Cracker Barrel",
    fallbackColor: "#8c6239" // Brown color
  },
  "cvs": {
    imagePath: resolveAssetPath("images/stores/cvs.png"),
    displayName: "CVS",
    fallbackColor: "#cc0000" // Red color
  },
  "dairyqueen": {
    imagePath: resolveAssetPath("images/stores/dairyqueen.png"),
    displayName: "Dairy Queen",
    fallbackColor: "#eb1c2e" // Red color
  },
  "ddsdiscounts": {
    imagePath: resolveAssetPath("images/stores/ddsdiscounts.png"),
    displayName: "DD's Discounts",
    fallbackColor: "#e41b17" // Red color
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
  "dominos": {
    imagePath: resolveAssetPath("images/stores/dominos.png"),
    displayName: "Domino's",
    fallbackColor: "#0078ae" // Blue color
  },
  "dunkin": {
    imagePath: resolveAssetPath("images/stores/dunkin.png"),
    displayName: "Dunkin",
    fallbackColor: "#ff671f" // Orange color
  },
  "exxon": {
    imagePath: resolveAssetPath("images/stores/exxon.png"),
    displayName: "Exxon",
    fallbackColor: "#e51636" // Red color
  },
  "familydollar": {
    imagePath: resolveAssetPath("images/stores/familydollar.png"),
    displayName: "Family Dollar",
    fallbackColor: "#006747" // Green color
  },
  "fivebelow": {
    imagePath: resolveAssetPath("images/stores/fivebelow.png"),
    displayName: "Five Below",
    fallbackColor: "#1e3264" // Blue color
  },
  "food4less": {
    imagePath: resolveAssetPath("images/stores/food4less.png"),
    displayName: "Food 4 Less",
    fallbackColor: "#e41b17" // Red color
  },
  "foodlion": {
    imagePath: resolveAssetPath("images/stores/foodlion.png"),
    displayName: "Food Lion",
    fallbackColor: "#ef3e42" // Red color
  },
  "fredmeyer": {
    imagePath: resolveAssetPath("images/stores/fredmeyer.png"),
    displayName: "Fred Meyer",
    fallbackColor: "#e41b17" // Red color
  },
  "fruiteriemilano": {
    imagePath: resolveAssetPath("images/stores/fruiteriemilano.png"),
    displayName: "Fruiterie Milano",
    fallbackColor: "#008c45" // Green color
  },
  "frys": {
    imagePath: resolveAssetPath("images/stores/frys.png"),
    displayName: "Fry's Food and Drug",
    fallbackColor: "#e41b17" // Red color
  },
  "giant": {
    imagePath: resolveAssetPath("images/stores/giant.png"),
    displayName: "Giant",
    fallbackColor: "#e41b17" // Red color
  },
  "gianteagle": {
    imagePath: resolveAssetPath("images/stores/gianteagle.png"),
    displayName: "Giant Eagle",
    fallbackColor: "#1258ba" // Blue color
  },
  "goldenmango": {
    imagePath: resolveAssetPath("images/stores/goldenmango.png"),
    displayName: "Golden Mango",
    fallbackColor: "#ffd700" // Gold color
  },
  "goodwill": {
    imagePath: resolveAssetPath("images/stores/goodwill.png"),
    displayName: "Goodwill",
    fallbackColor: "#00a5db" // Blue color
  },
  "hannaford": {
    imagePath: resolveAssetPath("images/stores/hannaford.png"),
    displayName: "Hannaford",
    fallbackColor: "#e41b17" // Red color
  },
  "harristeeter": {
    imagePath: resolveAssetPath("images/stores/harristeeter.png"),
    displayName: "Harris Teeter",
    fallbackColor: "#e41b17" // Red color
  },
  "heb": {
    imagePath: resolveAssetPath("images/stores/heb.png"),
    displayName: "H-E-B",
    fallbackColor: "#e41b17" // Red color
  },
  "hiepthai": {
    imagePath: resolveAssetPath("images/stores/hiepthai.png"),
    displayName: "Hiep Thai Food Store",
    fallbackColor: "#da251d" // Red color
  },
  "hobbylobby": {
    imagePath: resolveAssetPath("images/stores/hobbylobby.png"),
    displayName: "Hobby Lobby",
    fallbackColor: "#f58220" // Orange color
  },
  "homedepot": {
    imagePath: resolveAssetPath("images/stores/homedepot.png"),
    displayName: "Home Depot",
    fallbackColor: "#f96302" // Orange color
  },
  "hyvee": {
    imagePath: resolveAssetPath("images/stores/hyvee.png"),
    displayName: "HyVee",
    fallbackColor: "#e41b17" // Red color
  },
  "iga": {
    imagePath: resolveAssetPath("images/stores/iga.png"),
    displayName: "IGA",
    fallbackColor: "#e41b17" // Red color
  },
  "ingles": {
    imagePath: resolveAssetPath("images/stores/ingles.png"),
    displayName: "Ingles Markets",
    fallbackColor: "#e41b17" // Red color
  },
  "jackinthebox": {
    imagePath: resolveAssetPath("images/stores/jackinthebox.png"),
    displayName: "Jack in the Box",
    fallbackColor: "#e41b17" // Red color
  },
  "jerseymikes": {
    imagePath: resolveAssetPath("images/stores/jerseymikes.png"),
    displayName: "Jersey Mike's",
    fallbackColor: "#e41b17" // Red color
  },
  "jewelosco": {
    imagePath: resolveAssetPath("images/stores/jewelosco.png"),
    displayName: "Jewel Osco",
    fallbackColor: "#e41b17" // Red color
  },
  "kfc": {
    imagePath: resolveAssetPath("images/stores/kfc.png"),
    displayName: "KFC",
    fallbackColor: "#e4002b" // Red color
  },
  "kohls": {
    imagePath: resolveAssetPath("images/stores/kohls.png"),
    displayName: "Kohl's",
    fallbackColor: "#000000" // Black color
  },
  "kroger": {
    imagePath: resolveAssetPath("images/stores/kroger.png"),
    displayName: "Kroger",
    fallbackColor: "#002d74" // Blue color
  },
  "kwiktrip": {
    imagePath: resolveAssetPath("images/stores/kwiktrip.png"),
    displayName: "Kwik Trip",
    fallbackColor: "#e41b17" // Red color
  },
  "littlecaesars": {
    imagePath: resolveAssetPath("images/stores/littlecaesars.png"),
    displayName: "Little Caesars",
    fallbackColor: "#e41b17" // Red color
  },
  "lowes": {
    imagePath: resolveAssetPath("images/stores/lowes.png"),
    displayName: "Lowe's",
    fallbackColor: "#004990" // Blue color
  },
  "macys": {
    imagePath: resolveAssetPath("images/stores/macys.png"),
    displayName: "Macy's",
    fallbackColor: "#e41b17" // Red color
  },
  "marathon": {
    imagePath: resolveAssetPath("images/stores/marathon.png"),
    displayName: "Marathon",
    fallbackColor: "#e41b17" // Red color
  },
  "marshalls": {
    imagePath: resolveAssetPath("images/stores/marshalls.png"),
    displayName: "Marshalls",
    fallbackColor: "#e41b17" // Red color
  },
  "mcdonalds": {
    imagePath: resolveAssetPath("images/stores/mcdonalds.png"),
    displayName: "McDonald's",
    fallbackColor: "#ffcc00" // Yellow color
  },
  "meijer": {
    imagePath: resolveAssetPath("images/stores/meijer.png"),
    displayName: "Meijer",
    fallbackColor: "#e41b17" // Red color
  },
  "menards": {
    imagePath: resolveAssetPath("images/stores/menards.png"),
    displayName: "Menards",
    fallbackColor: "#e41b17" // Red color
  },
  "miamigrill": {
    imagePath: resolveAssetPath("images/stores/miamigrill.png"),
    displayName: "Miami Grill",
    fallbackColor: "#e41b17" // Red color
  },
  "michaels": {
    imagePath: resolveAssetPath("images/stores/michaels.png"),
    displayName: "Michaels",
    fallbackColor: "#e41b17" // Red color
  },
  "murphyusa": {
    imagePath: resolveAssetPath("images/stores/murphyusa.png"),
    displayName: "Murphy USA",
    fallbackColor: "#e41b17" // Red color
  },
  "oldnavy": {
    imagePath: resolveAssetPath("images/stores/oldnavy.png"),
    displayName: "Old Navy",
    fallbackColor: "#002b5c" // Blue color
  },
  "olivegarden": {
    imagePath: resolveAssetPath("images/stores/olivegarden.png"),
    displayName: "Olive Garden",
    fallbackColor: "#124116" // Green color
  },
  "pandaexpress": {
    imagePath: resolveAssetPath("images/stores/pandaexpress.png"),
    displayName: "Panda Express",
    fallbackColor: "#e41b17" // Red color
  },
  "panera": {
    imagePath: resolveAssetPath("images/stores/panera.png"),
    displayName: "Panera",
    fallbackColor: "#006344" // Green color
  },
  "papajohns": {
    imagePath: resolveAssetPath("images/stores/papajohns.png"),
    displayName: "Papa John's",
    fallbackColor: "#e41b17" // Red color
  },
  "peetscoffee": {
    imagePath: resolveAssetPath("images/stores/peetscoffee.png"),
    displayName: "Peets Coffee",
    fallbackColor: "#e41b17" // Red color
  },
  "petsmart": {
    imagePath: resolveAssetPath("images/stores/petsmart.png"),
    displayName: "Petsmart",
    fallbackColor: "#e41b17" // Red color
  },
  "picknsave": {
    imagePath: resolveAssetPath("images/stores/picknsave.png"),
    displayName: "Pick 'n Save",
    fallbackColor: "#e41b17" // Red color
  },
  "pizzahut": {
    imagePath: resolveAssetPath("images/stores/pizzahut.png"),
    displayName: "Pizza Hut",
    fallbackColor: "#e41b17" // Red color
  },
  "popeyes": {
    imagePath: resolveAssetPath("images/stores/popeyes.png"),
    displayName: "Popeye's",
    fallbackColor: "#e41b17" // Red color
  },
  "publix": {
    imagePath: resolveAssetPath("images/stores/publix.png"),
    displayName: "Publix",
    fallbackColor: "#007a3e" // Green color
  },
  "quiktrip": {
    imagePath: resolveAssetPath("images/stores/quiktrip.png"),
    displayName: "QuikTrip",
    fallbackColor: "#e41b17" // Red color
  },
  "ralphs": {
    imagePath: resolveAssetPath("images/stores/ralphs.png"),
    displayName: "Ralphs",
    fallbackColor: "#e41d34" // Red color
  },
  "redrobin": {
    imagePath: resolveAssetPath("images/stores/redrobin.png"),
    displayName: "Red Robin",
    fallbackColor: "#e41b17" // Red color
  },
  "riteaid": {
    imagePath: resolveAssetPath("images/stores/riteaid.png"),
    displayName: "Rite Aid",
    fallbackColor: "#e41b17" // Red color
  },
  "ross": {
    imagePath: resolveAssetPath("images/stores/ross.png"),
    displayName: "Ross",
    fallbackColor: "#e41b17" // Red color
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
  "samsclubfuel": {
    imagePath: resolveAssetPath("images/stores/samsclubfuel.png"),
    displayName: "Sam's Club Fuel",
    fallbackColor: "#0060a9" // Blue color
  },
  "savealot": {
    imagePath: resolveAssetPath("images/stores/savealot.png"),
    displayName: "Save a Lot",
    fallbackColor: "#e41b17" // Red color
  },
  "sephora": {
    imagePath: resolveAssetPath("images/stores/sephora.png"),
    displayName: "Sephora",
    fallbackColor: "#e41b17" // Red color
  },
  "sheetz": {
    imagePath: resolveAssetPath("images/stores/sheetz.png"),
    displayName: "Sheetz",
    fallbackColor: "#e41b17" // Red color
  },
  "shell": {
    imagePath: resolveAssetPath("images/stores/shell.png"),
    displayName: "Shell",
    fallbackColor: "#e41b17" // Red color
  },
  "shoecarnival": {
    imagePath: resolveAssetPath("images/stores/shoecarnival.png"),
    displayName: "Shoe Carnival",
    fallbackColor: "#e41b17" // Red color
  },
  "shoprite": {
    imagePath: resolveAssetPath("images/stores/shoprite.png"),
    displayName: "ShopRite",
    fallbackColor: "#e41b17" // Red color
  },
  "smiths": {
    imagePath: resolveAssetPath("images/stores/smiths.png"),
    displayName: "Smith's Food and Drug",
    fallbackColor: "#e41b17" // Red color
  },
  "smokeybones": {
    imagePath: resolveAssetPath("images/stores/smokeybones.png"),
    displayName: "Smokey Bones",
    fallbackColor: "#e41b17" // Red color
  },
  "sonic": {
    imagePath: resolveAssetPath("images/stores/sonic.png"),
    displayName: "Sonic",
    fallbackColor: "#0066b2" // Blue color
  },
  "speedway": {
    imagePath: resolveAssetPath("images/stores/speedway.png"),
    displayName: "Speedway",
    fallbackColor: "#e41b17" // Red color
  },
  "starbucks": {
    imagePath: resolveAssetPath("images/stores/starbucks.png"),
    displayName: "Starbucks",
    fallbackColor: "#006241" // Green color
  },
  "staterbrosmarkets": {
    imagePath: resolveAssetPath("images/stores/staterbrosmarkets.png"),
    displayName: "Stater Bros. Markets",
    fallbackColor: "#e41b17" // Red color
  },
  "stopnshop": {
    imagePath: resolveAssetPath("images/stores/stopnshop.png"),
    displayName: "Stop & Shop",
    fallbackColor: "#e41b17" // Red color
  },
  "subway": {
    imagePath: resolveAssetPath("images/stores/subway.png"),
    displayName: "Subway",
    fallbackColor: "#008c15" // Green color
  },
  "sunoco": {
    imagePath: resolveAssetPath("images/stores/sunoco.png"),
    displayName: "Sunoco",
    fallbackColor: "#e41b17" // Red color
  },
  "tacobell": {
    imagePath: resolveAssetPath("images/stores/tacobell.png"),
    displayName: "Taco Bell",
    fallbackColor: "#702082" // Purple color
  },
  "target": {
    imagePath: resolveAssetPath("images/stores/target.png"),
    displayName: "Target",
    fallbackColor: "#cc0000" // Red color
  },
  "tjmaxx": {
    imagePath: resolveAssetPath("images/stores/tjmaxx.png"),
    displayName: "TJ Maxx",
    fallbackColor: "#e11a2c" // Red color
  },
  "tomthumb": {
    imagePath: resolveAssetPath("images/stores/tomthumb.png"),
    displayName: "Tom Thumb",
    fallbackColor: "#e41b17" // Red color
  },
  "tractorsupplyco": {
    imagePath: resolveAssetPath("images/stores/tractorsupplyco.png"),
    displayName: "Tractor Supply Co",
    fallbackColor: "#e41b17" // Red color
  },
  "traderjoes": {
    imagePath: resolveAssetPath("images/stores/traderjoes.png"),
    displayName: "Trader Joe's",
    fallbackColor: "#cc0000" // Red color
  },
  "ultabeauty": {
    imagePath: resolveAssetPath("images/stores/ultabeauty.png"),
    displayName: "Ulta Beauty",
    fallbackColor: "#e41b17" // Red color
  },
  "usps": {
    imagePath: resolveAssetPath("images/stores/usps.png"),
    displayName: "USPS",
    fallbackColor: "#004b87" // Blue color
  },
  "vons": {
    imagePath: resolveAssetPath("images/stores/vons.png"),
    displayName: "Vons",
    fallbackColor: "#e41b17" // Red color
  },
  "walgreens": {
    imagePath: resolveAssetPath("images/stores/walgreens.png"),
    displayName: "Walgreens",
    fallbackColor: "#e41b17" // Red color
  },
  "walmart": {
    imagePath: resolveAssetPath("images/stores/walmart.png"),
    displayName: "Walmart",
    fallbackColor: "#0071ce" // Blue color
  },
  "wawa": {
    imagePath: resolveAssetPath("images/stores/wawa.png"),
    displayName: "Wawa",
    fallbackColor: "#e41b17" // Red color
  },
  "wegmans": {
    imagePath: resolveAssetPath("images/stores/wegmans.png"),
    displayName: "Wegmans",
    fallbackColor: "#e41b17" // Red color
  },
  "wendys": {
    imagePath: resolveAssetPath("images/stores/wendys.png"),
    displayName: "Wendy's",
    fallbackColor: "#e2203d" // Red color
  },
  "wholefoods": {
    imagePath: resolveAssetPath("images/stores/wholefoods.png"),
    displayName: "Whole Foods Market",
    fallbackColor: "#004e37" // Green color
  },
  "winco": {
    imagePath: resolveAssetPath("images/stores/winco.png"),
    displayName: "Winco",
    fallbackColor: "#e41b17" // Red color
  },
  "wingstop": {
    imagePath: resolveAssetPath("images/stores/wingstop.png"),
    displayName: "Wingstop",
    fallbackColor: "#e41b17" // Red color
  },
  "winndixie": {
    imagePath: resolveAssetPath("images/stores/winndixie.png"),
    displayName: "Winn Dixie",
    fallbackColor: "#d40000" // Red color
  },
  "woodmans": {
    imagePath: resolveAssetPath("images/stores/woodmans.png"),
    displayName: "Woodman's Market",
    fallbackColor: "#e41b17" // Red color
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
    // For non-registry stores, explicitly use a path guaranteed to work with our path resolution
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