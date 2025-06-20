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

const BenchmarkRow = ({ data }) => {
  if (!data) return null;
  return (
    <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 600 }}>
      <td style={{ padding: '0.75rem' }}>
        {data.Symbol}
        <span
          style={{
            marginLeft: '0.5rem',
            backgroundColor: '#e5e7eb',
            color: '#374151',
            padding: '0.125rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}
        >
          Benchmark
        </span>
      </td>
      <td style={{ padding: '0.75rem' }}>{data['Fund Name'] || data.name}</td>
      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
        {data.scores ? <ScoreBadge score={data.scores.final} /> : '-'}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(data.ytd ?? data.YTD)}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(data.oneYear ?? data['1 Year'])}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(data.threeYear ?? data['3 Year'])}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(data.fiveYear ?? data['5 Year'])}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtNumber(data.sharpe ?? data['Sharpe Ratio'])}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(data.stdDev5y ?? data['Standard Deviation'])}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {fmtPct(data.expense ?? data['Net Expense Ratio'])}
      </td>
    </tr>
  );
};

export default BenchmarkRow;
