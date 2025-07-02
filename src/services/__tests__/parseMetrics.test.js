import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import parseFundFile from '@/utils/parseFundFile';
import { recommendedFunds, assetClassBenchmarks } from '@/data/config';

test.skip('BUYZ metrics parsed correctly', async () => {
  const csvPath = path.resolve(__dirname, '../../../data/Fund_Performance_Data.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const wb = XLSX.read(csv, { type: 'string' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  const result = await parseFundFile(rows, { recommendedFunds, assetClassBenchmarks });
  const buyz = result.find(r => r.Symbol === 'BUYZ');
  expect(buyz).toBeDefined();
});
