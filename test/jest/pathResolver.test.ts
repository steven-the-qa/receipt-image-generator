import { resolveAssetPath } from '../../src/utils/pathResolver';

describe('resolveAssetPath', () => {
  it('normalizes path without leading slash and returns path with leading slash', () => {
    const result = resolveAssetPath('images/stores/walmart.png');
    expect(result).toBe('/images/stores/walmart.png');
  });

  it('normalizes leading slash and returns root-relative path', () => {
    const result = resolveAssetPath('/images/stores/walmart.png');
    expect(result).toBe('/images/stores/walmart.png');
  });

  it('removes only the first leading slash when multiple are present', () => {
    // Function removes first slash, then adds one back, so //images becomes //images
    // substring(1) on "//images" gives "/images", then adding "/" gives "//images"
    const result = resolveAssetPath('//images/stores/walmart.png');
    expect(result).toBe('//images/stores/walmart.png');
  });
});

