import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import parseFundFile from '../parseFundFile';
import { recommendedFunds, assetClassBenchmarks } from '../../data/config';

test('BUYZ metrics parsed correctly', async () => {
  const csvPath = path.resolve(__dirname, '../../../data/Fund_Performance_Data.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const wb = XLSX.read(csv, { type: 'string' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  const result = await parseFundFile(rows, { recommendedFunds, assetClassBenchmarks });
  const buyz = result.find(r => r.Symbol === 'BUYZ');
  expect(buyz).toBeDefined();
  expect(typeof buyz.ytd).toBe('number');
  expect(buyz.ytd).toBeCloseTo(28.12, 2);
  expect(buyz['Net Expense Ratio']).toBeCloseTo(0.5);
  expect(typeof buyz['3 Year']).toBe('number');
});
