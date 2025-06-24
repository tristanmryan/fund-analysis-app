import React from 'react';
import { fmtPct, fmtNumber } from '../utils/formatters';
import ScoreBadge from './common/ScoreBadge.jsx';

const BenchmarkRow = ({ data, fund }) => {
  const row = data || fund;
  if (!row) return null;
  return (
    <table className="w-full border-collapse mb-2">
      <tbody>
        <tr className="benchmark-banner">
          <td className="px-3 py-1">{`Benchmark — ${row.Symbol}`}</td>
          <td className="px-3 py-1">{row['Fund Name'] || row.name}</td>
          <td className="px-3 py-1 text-center">
            {row.scores ? <ScoreBadge score={row.scores.final} /> : '-'}
          </td>
          <td className="px-3 py-1 text-right">{fmtPct(row.ytd ?? row.YTD)}</td>
          <td className="px-3 py-1 text-right">{fmtPct(row.oneYear ?? row['1 Year'])}</td>
          <td className="px-3 py-1 text-right hidden sm:table-cell">{fmtPct(row.threeYear ?? row['3 Year'])}</td>
          <td className="px-3 py-1 text-right hidden sm:table-cell">{fmtPct(row.fiveYear ?? row['5 Year'])}</td>
          <td className="px-3 py-1 text-right">{fmtNumber(row.sharpe ?? row['Sharpe Ratio'])}</td>
          <td className="px-3 py-1 text-right hidden sm:table-cell">{fmtPct(row.stdDev5y ?? row['Standard Deviation'])}</td>
          <td className="px-3 py-1 text-right hidden sm:table-cell">{fmtPct(row.expense ?? row['Net Expense Ratio'])}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default BenchmarkRow;
