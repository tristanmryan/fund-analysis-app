import { loadAssetClassMap, lookupAssetClass, clearAssetClassMap, getAssetClassOptions } from '@/services/dataLoader';

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

  test('getAssetClassOptions returns classes', () => {
    const data = [
      { assetClass: 'Large Cap Growth' },
      { assetClass: 'Large Cap Value' },
      { assetClass: 'Large Cap Growth' },
      { assetClass: 'Benchmark' }
    ];
    const opts = getAssetClassOptions(data);
    expect(Array.isArray(opts)).toBe(true);
    expect(opts.length).toBeGreaterThan(0);
    expect(opts).toContain('Large Cap Growth');
    expect(opts).not.toContain('Benchmark');
  });
});
