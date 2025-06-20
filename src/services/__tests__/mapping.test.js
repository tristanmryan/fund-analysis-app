import { loadAssetClassMap, lookupAssetClass, clearAssetClassMap } from '../dataLoader';

describe('asset class mapping', () => {
  beforeAll(async () => {
    await loadAssetClassMap();
  });

  afterAll(() => {
    clearAssetClassMap();
  });

  test('VFIAX resolves to Large Cap Blend', () => {
    expect(lookupAssetClass('VFIAX')).toBe('Large Cap Blend');
  });
});
