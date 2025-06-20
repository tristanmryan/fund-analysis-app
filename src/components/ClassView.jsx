import React from 'react';
import BenchmarkRow from './BenchmarkRow.jsx';
import { fmtPct, fmtNumber } from '../utils/formatters';
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

const ClassView = ({ funds = [] }) => {
  const benchmark = funds.find(r => r.isBenchmark);
  const peers = funds
    .filter(r => !r.isBenchmark)
    .sort((a, b) => (b.scores?.final || 0) - (a.scores?.final || 0));

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Symbol</th>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
          <th style={{ padding: '0.75rem', textAlign: 'center' }}>Score</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>YTD</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>1Y</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>3Y</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>5Y</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>Sharpe</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>Std Dev</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>Expense</th>
        </tr>
      </thead>
      <tbody>
        {benchmark && <BenchmarkRow fund={benchmark} />}
        {peers.map((fund, idx) => (
          <tr
            key={idx}
            style={{
              borderBottom: '1px solid #f3f4f6',
              backgroundColor: fund.isRecommended ? '#eff6ff' : 'white'
            }}
          >
            <td style={{ padding: '0.75rem' }}>
              {fund.Symbol}
              {fund.isRecommended && (
                <span
                  style={{
                    marginLeft: '0.5rem',
                    backgroundColor: '#34d399',
                    color: '#064e3b',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  Rec
                </span>
              )}
            </td>
            <td style={{ padding: '0.75rem' }}>{fund['Fund Name']}</td>
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
              {fund.scores ? <ScoreBadge score={fund.scores.final} /> : '-'}
            </td>
            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{fmtPct(fund.ytd ?? fund.YTD)}</td>
            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{fmtPct(fund.oneYear ?? fund['1 Year'])}</td>
            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{fmtPct(fund.threeYear ?? fund['3 Year'])}</td>
            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{fmtPct(fund.fiveYear ?? fund['5 Year'])}</td>
            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{fmtNumber(fund.sharpe ?? fund['Sharpe Ratio'])}</td>
            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{fmtPct(fund.stdDev5y ?? fund['Standard Deviation'])}</td>
            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{fmtPct(fund.expense ?? fund['Net Expense Ratio'])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClassView;
