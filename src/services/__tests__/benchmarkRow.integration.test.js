import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import parseFundFile from '../parseFundFile';
import { recommendedFunds, assetClassBenchmarks } from '../../data/config';
import { calculateScores } from '../scoring';

const clean = s => s?.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');

test('Large Cap Growth benchmark included with metrics', async () => {
  const csvPath = path.resolve(__dirname, '../../../data/Fund_Performance_Data.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const wb = XLSX.read(csv, { type: 'string' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  const parsed = await parseFundFile(rows, { recommendedFunds, assetClassBenchmarks });
  const withFlags = parsed.map(f => {
    const symbol = clean(f.Symbol);
    let benchmarkForClass = null;
    Object.entries(assetClassBenchmarks).forEach(([ac, b]) => {
      if (clean(b.ticker) === symbol) benchmarkForClass = ac;
    });
    return {
      ...f,
      cleanSymbol: symbol,
      isBenchmark: benchmarkForClass != null,
      benchmarkForClass,
    };
  });
  const scored = calculateScores(withFlags);
  const bench = scored.find(f => f.isBenchmark && f.benchmarkForClass === 'Large Cap Growth');
  expect(bench).toBeDefined();
  expect(bench.Symbol).toBe('IWF');
  expect(typeof bench['1 Year']).toBe('number');
});
