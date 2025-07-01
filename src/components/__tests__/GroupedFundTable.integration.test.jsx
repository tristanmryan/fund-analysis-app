import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GroupedFundTable from '@/components/GroupedFundTable';
import parseFundFile from '@/utils/parseFundFile';
import { recommendedFunds, assetClassBenchmarks } from '@/data/config';
import { calculateScores } from '@/services/scoring';
import { ensureBenchmarkRows } from '@/services/dataLoader';

const clean = s => s?.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');

async function loadFunds() {
  const csvPath = path.resolve(__dirname, '../../../data/Fund_Performance_Data.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const wb = XLSX.read(csv, { type: 'string' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  const parsed = await parseFundFile(rows, { recommendedFunds, assetClassBenchmarks });
  const withFlags = parsed.map(f => {
    const sym = clean(f.Symbol);
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

test('accordion expands to show benchmark row', async () => {
  const funds = await loadFunds();
  render(<GroupedFundTable funds={funds} />);
  const header = screen.getByText('Large Cap Growth');
  expect(header).toBeInTheDocument();
  await userEvent.click(header);
  expect(await screen.findByText(/Benchmark — IWF/i)).toBeInTheDocument();
});
