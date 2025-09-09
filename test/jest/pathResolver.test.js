import { resolveAssetPath } from '../../src/utils/pathResolver';

describe('resolveAssetPath', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.REACT_APP_DEPLOY;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns base path for production-like deploys', () => {
    process.env.REACT_APP_DEPLOY = 'true';
    const result = resolveAssetPath('images/stores/walmart.png');
    expect(result).toBe('/receipt-image-generator/images/stores/walmart.png');
  });

  it('normalizes leading slash and returns root-relative path in dev', () => {
    const result = resolveAssetPath('/images/stores/walmart.png');
    expect(result).toBe('/images/stores/walmart.png');
  });
});
