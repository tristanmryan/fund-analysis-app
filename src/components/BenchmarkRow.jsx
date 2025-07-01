import React from 'react';
import { fmtPct, fmtNumber } from '../utils/formatters';

const BenchmarkRow = ({ fund }) => {
  const row = fund;
  if (!row) return null;
  return (
    <tr className="bg-slate-100 font-medium">
      <td className="px-3 py-3">{`Benchmark — ${row.Symbol}`}</td>
      <td className="px-3 py-3">{row.fundName || row.name}</td>
      <td className="px-3 py-3">Benchmark</td>
      <td className="px-3 py-3 text-center">
        {row.score != null
          ? <ScoreBadge score={row.score} />
          : row.scores
            ? <ScoreBadge score={row.scores.final} />
            : '-'}
      </td>
      <td className="px-3 py-3"></td>
      <td className="px-3 py-3"></td>
      <td className="px-3 py-3 text-right">
        {fmtPct(row.ytd ?? row.YTD)}
      </td>
      <td className="px-3 py-3 text-right">
        {fmtPct(row.oneYear)}
      </td>
      <td className="px-3 py-3 text-right">
        {fmtPct(row.threeYear)}
      </td>
      <td className="px-3 py-3 text-right">
        {fmtPct(row.fiveYear)}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtNumber(row.sharpe3Y)}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(row.stdDev5Y)}
      </td>
      <td className="px-3 py-3 text-right">
        {fmtPct(row.expenseRatio)}
      </td>
      <td className="px-3 py-3"></td>
    </tr>
  );
};

export default BenchmarkRow;
