import 'fake-indexeddb/auto';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassView from '../ClassView.jsx';
import { useSnapshot } from '../../contexts/SnapshotContext';

jest.mock('../../contexts/SnapshotContext', () => ({
  useSnapshot: jest.fn()
}));
import parseFundFile from '@/utils/parseFundFile';
import { CURRENT_PERFORMANCE_HEADERS as CUR } from '@/docs/schema';

global.structuredClone =
  global.structuredClone || ((v) => JSON.parse(JSON.stringify(v)));
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
    const sym = clean(f.Symbol || f[CUR[0]]);
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

beforeEach(async () => {
  const scored = await loadFunds();
  useSnapshot.mockReturnValue({ active: { rows: scored }, setActive: jest.fn(), list: [] })
})

test('benchmarks visible in class views', async () => {
  render(<ClassView defaultAssetClass="Large Cap Growth" />);
  expect(screen.getByText(/Benchmark — IWF/i)).toBeVisible();

  render(<ClassView defaultAssetClass="Intermediate Muni" />);
  expect(screen.getByText(/Benchmark — ITM/i)).toBeVisible();
});
