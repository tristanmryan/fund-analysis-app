import parseFundFile from '../parseFundFile';
import { loadAssetClassMap, clearAssetClassMap } from '../dataLoader';

describe('parseFundFile', () => {
  beforeAll(async () => {
    await loadAssetClassMap();
  });

  afterAll(() => {
    clearAssetClassMap();
  });

  test('parses expense, type and asset class', async () => {
    const rows = [
      ['Symbol', 'Product Name', 'Net Exp Ratio (%)', 'Vehicle Type', 'Standard Deviation - 5 Year'],
      ['VFIAX', 'Vanguard 500 Index Admiral', '0.04', 'MF', '18.05'],
      ['APDJX', 'Artisan International Small-Mid', '0.12', 'MF', '18.05']
    ];
    const result = await parseFundFile(rows);
    expect(result[0]['Net Expense Ratio']).toBeCloseTo(0.04);
    expect(result[0].Type).toBe('MF');
    expect(result[0]['Standard Deviation']).toBeCloseTo(18.05);
    expect(result[0]['Asset Class']).toBe('Large Cap Blend');
    expect(result[1]['Asset Class']).toBe('International Stock (Small/Mid Cap)');
  });

  test('does not throw and sets assetClass', async () => {
    const rows = [
      ['Symbol', 'Product Name', 'Net Exp Ratio (%)'],
      ['VFIAX', 'Vanguard 500 Index Admiral', '0.04']
    ];
    const result = await parseFundFile(rows);
    expect(result[0].assetClass).toBeTruthy();
  });
});
