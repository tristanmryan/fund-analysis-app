import React from 'react';
import { getScoreColor, getScoreLabel } from '../services/scoring';

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
        {data['1 Year']?.toFixed(2) ?? 'N/A'}%
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {data['3 Year']?.toFixed(2) ?? 'N/A'}%
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {data['5 Year']?.toFixed(2) ?? 'N/A'}%
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {data['Sharpe Ratio']?.toFixed(2) ?? 'N/A'}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {data['Standard Deviation']?.toFixed(2) ?? 'N/A'}%
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
        {data['Net Expense Ratio']?.toFixed(2) ?? 'N/A'}%
      </td>
    </tr>
  );
};

export default BenchmarkRow;
