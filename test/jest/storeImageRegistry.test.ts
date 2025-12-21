import { getStoreImageData, storeImageRegistry, formatStoreName } from '../../src/data/storeImageRegistry';

interface StoreImageData {
  imagePath: string;
  displayName: string;
  fallbackColor: string;
}

describe('getStoreImageData', () => {
  it('returns known registry entry with correct displayName and path', () => {
    const data = getStoreImageData('walgreens');
    expect(data).not.toBeNull();
    expect(data!.displayName).toBe('Walgreens');
    expect(typeof data!.imagePath).toBe('string');
    expect(data!.imagePath.endsWith('/images/stores/walgreens.png')).toBe(true);
    expect(data!.fallbackColor).toBe('#e41b17');
  });

  it('normalizes irregular keys and formats unknown display names', () => {
    const data = getStoreImageData('TJ-Maxx');
    expect(data).not.toBeNull();
    expect(data!.displayName).toBe('TJ Maxx');
    expect(data!.imagePath.endsWith('/images/stores/tjmaxx.png')).toBe(true);
    expect(data!.fallbackColor).toBe('#e11a2c');
  });

  it('generates fallback for unlisted store with default color and formatted name', () => {
    const data = getStoreImageData('FooBarBaz');
    expect(data).not.toBeNull();
    expect(data!.displayName).toBe('Foo Bar Baz');
    expect(data!.imagePath.endsWith('/images/stores/foobarbaz.png')).toBe(true);
    expect(data!.fallbackColor).toBe('#cccccc');
  });

  it('returns null when storeKey is falsy', () => {
    expect(getStoreImageData(undefined)).toBeNull();
    expect(getStoreImageData('')).toBeNull();
  });

  it('normalizes store key with spaces and finds registry entry', () => {
    const data = getStoreImageData('Home Depot');
    expect(data).not.toBeNull();
    expect(data!.displayName).toBe('Home Depot');
    expect(data!.imagePath.endsWith('/images/stores/homedepot.png')).toBe(true);
  });

  it('falls back and applies special-case formatting when registry entry is missing', () => {
    // Temporarily remove a special-case key from the registry to force fallback
    const original = storeImageRegistry.usps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (storeImageRegistry as any).usps;

    try {
      const data = getStoreImageData('USPS');
      // Should use special-cases map inside formatStoreName()
      expect(data).not.toBeNull();
      expect(data!.displayName).toBe('USPS');
      expect(data!.imagePath.endsWith('/images/stores/usps.png')).toBe(true);
      expect(data!.fallbackColor).toBe('#cccccc');
    } finally {
      // Restore registry to avoid impacting other tests
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (storeImageRegistry as any).usps = original;
    }
  });

  it('formatStoreName handles empty and default formatting cases', () => {
    expect(formatStoreName('')).toBe('');
    expect(formatStoreName('kfc')).toBe('KFC');
    expect(formatStoreName('tjmaxx')).toBe('TJ Maxx');
    expect(formatStoreName('homeDepot')).toBe('Home Depot');
    expect(formatStoreName('fooBarBaz')).toBe('Foo Bar Baz');
  });
});
