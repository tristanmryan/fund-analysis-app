import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import parseFundFile from '@/utils/parseFundFile';
import { CURRENT_PERFORMANCE_HEADERS as CUR } from '@/docs/schema';
import { recommendedFunds, assetClassBenchmarks } from '@/data/config';
import { loadAssetClassMap, clearAssetClassMap } from '@/services/dataLoader';

describe('parseFundFile', () => {
  beforeAll(async () => {
    await loadAssetClassMap();
  });

  afterAll(() => {
    clearAssetClassMap();
  });

  test('parses expense ratio and asset class', async () => {
    const rows = [
      ['Symbol', CUR[1], CUR[21], 'Vehicle Type', 'Standard Deviation - 5 Year'],
      ['VFIAX', 'Vanguard 500 Index Admiral', '0.04', 'MF', '18.05'],
      ['APDJX', 'Artisan International Small-Mid', '0.12', 'MF', '18.05']
    ];
    const result = await parseFundFile(rows, { recommendedFunds, assetClassBenchmarks });
    expect(result[0].expenseRatio).toBeCloseTo(0.04);
    expect(result[0].stdDev5Y).toBeCloseTo(18.05);
    expect(result[0].assetClass).toBe('Large Cap Blend');
    expect(result[1].assetClass).toBe('International Stock (Small/Mid Cap)');
  });

  test('does not throw and sets assetClass', async () => {
    const rows = [
      ['Symbol', CUR[1], CUR[21]],
      ['VFIAX', 'Vanguard 500 Index Admiral', '0.04']
    ];
    const result = await parseFundFile(rows, { recommendedFunds, assetClassBenchmarks });
    expect(result[0].assetClass).toBeTruthy();
  });

  test('IWF row parsed', async () => {
    const csvPath = path.resolve(__dirname, '../../../data/Fund_Performance_Data.csv');
    const csv = fs.readFileSync(csvPath, 'utf8');
    const wb = XLSX.read(csv, { type: 'string' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
    const result = await parseFundFile(rows, { recommendedFunds, assetClassBenchmarks });
    const iwf = result.find(f => f.Symbol === 'IWF');
    expect(iwf.assetClass).toBe('Large Cap Growth');
  });
});
