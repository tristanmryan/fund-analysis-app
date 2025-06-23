import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassView from '../ClassView.jsx';
import parseFundFile from '../../services/parseFundFile';
import { recommendedFunds, assetClassBenchmarks } from '../../data/config';
import { calculateScores } from '../../services/scoring';
import { ensureBenchmarkRows } from '../../services/dataLoader';

const clean = s => s?.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');

async function loadFunds() {
  const csvPath = path.resolve(__dirname, '../../../data/Fund_Performance_Data.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const wb = XLSX.read(csv, { type: 'string' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  const parsed = await parseFundFile(rows, { recommendedFunds, assetClassBenchmarks });
  const withFlags = parsed.map(f => {
    const sym = clean(f.Symbol || f['Symbol/CUSIP']);
    let benchmarkForClass = null;
    Object.entries(assetClassBenchmarks).forEach(([ac, b]) => {
      if (clean(b.ticker) === sym) benchmarkForClass = ac;
    });
    return {
      ...f,
      cleanSymbol: sym,
      isBenchmark: benchmarkForClass != null,
      benchmarkForClass,
    };
  });
  const withBench = ensureBenchmarkRows(withFlags);
  return calculateScores(withBench);
}

test('benchmarks visible in class views', async () => {
  const scored = await loadFunds();
  const largeCap = scored.filter(f => f.assetClass === 'Large Cap Growth');
  render(<ClassView funds={largeCap} />);
  expect(screen.getByText(/Benchmark — IWF/i)).toBeVisible();

  const muni = scored.filter(f => f.assetClass === 'Intermediate Muni');
  render(<ClassView funds={muni} />);
  expect(screen.getByText(/Benchmark — ITM/i)).toBeVisible();
});
