import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BenchmarkRow from '../BenchmarkRow.jsx';
import parseFundFile from '../../services/parseFundFile';
import { recommendedFunds, assetClassBenchmarks } from '../../data/config';
import { calculateScores } from '../../services/scoring';
import { ensureBenchmarkRows } from '../../services/dataLoader';

const clean = s => s?.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');

function ClassView({ funds }) {
  const benchmark = funds.find(f => f.isBenchmark);
  const peers = funds.filter(f => !f.isBenchmark);
  const summaryScore = benchmark?.scores?.final ?? 'N/A';
  return (
    <div>
      <div data-testid="summary">{summaryScore}</div>
      <table>
        <tbody>
          {benchmark && <BenchmarkRow fund={benchmark} />}
          {peers.map(f => (
            <tr key={f.Symbol}>
              <td>{f.Symbol}</td>
              <td>{f['Fund Name']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

test('benchmark row and summary rendered', async () => {
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
  const withBench = ensureBenchmarkRows(withFlags);
  const scored = calculateScores(withBench);
  const funds = scored.filter(f => f.assetClass === 'Large Cap Growth');
  render(<ClassView funds={funds} />);
  expect(screen.getByText(/Benchmark — IWF/i)).toBeInTheDocument();
  expect(screen.getByTestId('summary').textContent).not.toBe('N/A');
});
