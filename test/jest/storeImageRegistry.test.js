import { getStoreImageData } from '../../src/data/storeImageRegistry';

describe('getStoreImageData', () => {
  it('returns known registry entry with correct displayName and path', () => {
    const data = getStoreImageData('walgreens');
    expect(data.displayName).toBe('Walgreens');
    expect(typeof data.imagePath).toBe('string');
    expect(data.imagePath.endsWith('/images/stores/walgreens.png')).toBe(true);
    expect(data.fallbackColor).toBe('#e41b17');
  });

  it('normalizes irregular keys and formats unknown display names', () => {
    const data = getStoreImageData('TJ-Maxx');
    expect(data.displayName).toBe('TJ Maxx');
    expect(data.imagePath.endsWith('/images/stores/tjmaxx.png')).toBe(true);
    expect(data.fallbackColor).toBe('#e11a2c');
  });

  it('generates fallback for unlisted store with default color and formatted name', () => {
    const data = getStoreImageData('FooBarBaz');
    expect(data.displayName).toBe('Foo Bar Baz');
    expect(data.imagePath.endsWith('/images/stores/foobarbaz.png')).toBe(true);
    expect(data.fallbackColor).toBe('#cccccc');
  });
});
