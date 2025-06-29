import React from 'react';
import { getScoreColor, getScoreLabel } from '../utils/scoreTags';
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
        fontWeight: 'bold',
        padding: '0.25rem 0.5rem',
        display: 'inline-block',
        minWidth: '3rem',
        textAlign: 'center'
      }}
    >
      {Number(score).toFixed(1)} - {label}
    </span>
  );
};

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
