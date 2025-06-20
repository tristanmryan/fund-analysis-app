import { loadAssetClassMap, lookupAssetClass, clearAssetClassMap, getAssetClassOptions } from '../dataLoader';

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
      { 'Asset Class': 'Large Cap Growth' },
      { 'Asset Class': 'Large Cap Value' },
      { 'Asset Class': 'Large Cap Growth' },
      { 'Asset Class': 'Benchmark' }
    ];
    const opts = getAssetClassOptions(data);
    expect(Array.isArray(opts)).toBe(true);
    expect(opts.length).toBeGreaterThan(0);
    expect(opts).toContain('Large Cap Growth');
    expect(opts).not.toContain('Benchmark');
  });
});
