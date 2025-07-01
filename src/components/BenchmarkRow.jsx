import React from 'react';
import ScoreBadge from '@/components/ScoreBadge';
import { fmtPct, fmtNumber } from '../utils/formatters';


const BenchmarkRow = ({ fund }) => {
  const row = fund;
  if (!row) return null;
  return (
    <tr className="benchmark-banner">
      <td style={{ padding: '0.75rem' }}>{`Benchmark — ${row.Symbol}`}</td>
      <td style={{ padding: '0.75rem' }}>{row.fundName || row.name}</td>
      <td style={{ padding: '0.75rem' }}>Benchmark</td>
      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
        {row.score != null
          ? <ScoreBadge score={row.score} />
          : row.scores
            ? <ScoreBadge score={row.scores.final} />
            : '-'}
      </td>
      <td style={{ padding: '0.75rem' }}></td>
      <td style={{ padding: '0.75rem' }}></td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(row.ytd ?? row.YTD)}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(row.oneYear)}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(row.threeYear)}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(row.fiveYear)}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtNumber(row.sharpe3y)}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(row.stdDev5y)}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(row.expenseRatio)}
      </td>
      <td style={{ padding: '0.75rem' }}></td>
    </tr>
  );
};

export default BenchmarkRow;
