import parseFundFile from '../parseFundFile';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

test('parseFundFile does not throw for browser CSV sample', async () => {
  const csvPath = path.resolve(__dirname, '../../../data/Fund_Performance_Data.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const wb = XLSX.read(csv, { type: 'string' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  await expect(parseFundFile(rows)).resolves.toBeDefined();
});
