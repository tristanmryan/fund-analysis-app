import React from 'react';
import { getScoreColor, getScoreLabel } from '../services/scoring';
import { fmtPct, fmtNumber } from '../utils/formatters';

const ScoreBadge = ({ score }) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  return (
    <span
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}50`,
        borderRadius: '9999px',
        fontSize: '0.75rem',
        padding: '0.25rem 0.5rem',
        display: 'inline-block',
        minWidth: '3rem',
        textAlign: 'center'
      }}
    >
      {score} - {label}
    </span>
  );
};

const BenchmarkRow = ({ data, fund }) => {
  const row = data || fund;
  if (!row) return null;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
      <tbody>
        <tr className="benchmark-banner">
          <td style={{ padding: '0.75rem' }}>{`Benchmark — ${row.Symbol}`}</td>
          <td style={{ padding: '0.75rem' }}>{row['Fund Name'] || row.name}</td>
          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
            {row.scores ? <ScoreBadge score={row.scores.final} /> : '-'}
          </td>
          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
            {fmtPct(row.ytd ?? row.YTD)}
          </td>
          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
            {fmtPct(row.oneYear ?? row['1 Year'])}
          </td>
          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
            {fmtPct(row.threeYear ?? row['3 Year'])}
          </td>
          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
            {fmtPct(row.fiveYear ?? row['5 Year'])}
          </td>
          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
            {fmtNumber(row.sharpe ?? row['Sharpe Ratio'])}
          </td>
          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
            {fmtPct(row.stdDev5y ?? row['Standard Deviation'])}
          </td>
          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
            {fmtPct(row.expense ?? row['Net Expense Ratio'])}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default BenchmarkRow;
