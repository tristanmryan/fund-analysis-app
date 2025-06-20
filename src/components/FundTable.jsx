import React from 'react';
import TagList from './TagList.jsx';
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

const FundTable = ({ funds = [], onRowClick = () => {} }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Symbol</th>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fund Name</th>
          <th style={{ padding: '0.75rem', textAlign: 'center' }}>Score</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>YTD</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>1Y</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>3Y</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>5Y</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>Sharpe</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>Std Dev (5Y)</th>
          <th style={{ padding: '0.75rem', textAlign: 'right' }}>Expense</th>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tags</th>
        </tr>
      </thead>
      <tbody>
        {funds.map(fund => (
          <tr
            key={fund.Symbol}
            style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onRowClick(fund)}
            onClick={() => onRowClick(fund)}
          >
            <td style={{ padding: '0.5rem' }}>{fund.Symbol}</td>
            <td style={{ padding: '0.5rem' }}>{fund['Fund Name']}</td>
            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
              {fund.scores ? <ScoreBadge score={fund.scores.final} /> : '-'}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.ytd ?? fund.YTD)}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.oneYear ?? fund['1 Year'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.threeYear ?? fund['3 Year'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.fiveYear ?? fund['5 Year'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtNumber(fund.sharpe ?? fund['Sharpe Ratio'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.stdDev5y ?? fund['Standard Deviation'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.expense ?? fund['Net Expense Ratio'])}
            </td>
            <td style={{ padding: '0.5rem' }}>
              {Array.isArray(fund.tags) && fund.tags.length > 0 ? (
                <TagList tags={fund.tags} />
              ) : (
                <span style={{ color: '#9ca3af' }}>-</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default FundTable;
