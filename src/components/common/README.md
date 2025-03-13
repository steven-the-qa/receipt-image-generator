# Store Image System

This directory contains components that handle the display of store logos and names throughout the receipt generator application.

## StoreImage Component

The `StoreImage` component provides a robust way to display store logos with proper fallbacks.

### Features

- **Image Preloading**: Uses React's `useEffect` to preload images before rendering
- **Graceful Fallbacks**: Automatically falls back to text display if images fail to load
- **Brand-Consistent Colors**: Uses store-specific brand colors for fallback backgrounds
- **Proper Naming**: Handles special cases like "7-Eleven", "CVS", etc.
- **Flexible Sizing**: Supports small, medium, and large preset sizes
- **Accessibility**: Properly handles aria attributes for screen readers

### Usage

```jsx
// Basic usage
<StoreImage storeName="walmart" />

// Large size with custom class
<StoreImage 
  storeName="7eleven" 
  size="large" 
  className="my-4"
/>

// Always show the store name below the logo
<StoreImage
  storeName="target"
  showName={true}
/>
```

## Store Image Registry

The registry system in `src/data/storeImageRegistry.js` provides:

1. A central database of store information
2. Mapping between internal store keys and display names
3. Brand-specific colors for fallback displays
4. Formatting rules for store names

### Adding a New Store

To add a new store to the system:

1. Add the store's logo image to `public/images/stores/` (use lowercase, no spaces or special characters)
2. Add an entry to the `storeImageRegistry` object:

```js
"storename": {
  imagePath: "/images/stores/storename.png",
  displayName: "Store Name",
  fallbackColor: "#brand-color-hex"
}
```

## Benefits of This Approach

- **Centralized Management**: Single source of truth for store data
- **Improved Reliability**: Better image loading with proper fallbacks
- **Consistent Styling**: Unified approach to displaying store branding
- **Reusability**: Component can be used anywhere in the application
- **Maintainability**: Easier to update and add new stores 