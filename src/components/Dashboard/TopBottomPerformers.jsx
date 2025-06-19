import React from 'react';
import { getScoreColor, getScoreLabel } from '../../services/scoring';
import TagList from '../TagList.jsx';
import { BarChart2 } from 'lucide-react';

/**
 * Display the top 5 and bottom 5 performing recommended funds.
 * Expects an array of scored fund objects with fields:
 *   - Fund Name
 *   - Symbol
 *   - Asset Class
 *   - scores.final
 *   - tags (array of strings)
 *   - isBenchmark
 *   - isRecommended
 */
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

const FundRow = ({ fund }) => (
  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
    <td style={{ padding: '0.5rem' }}>{fund['Fund Name']}</td>
    <td style={{ padding: '0.5rem' }}>{fund.Symbol}</td>
    <td style={{ padding: '0.5rem' }}>{fund['Asset Class']}</td>
    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
      <ScoreBadge score={fund.scores?.final || 0} />
    </td>
    <td style={{ padding: '0.5rem' }}>
      {Array.isArray(fund.tags) && fund.tags.length > 0 ? (
        <TagList tags={fund.tags} />
      ) : (
        <span style={{ color: '#9ca3af' }}>-</span>
      )}
    </td>
    <td style={{ padding: '0.5rem' }}>
      {fund.isBenchmark && (
        <span
          style={{
            backgroundColor: '#fbbf24',
            color: '#78350f',
            padding: '0.125rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}
        >
          Benchmark
        </span>
      )}
    </td>
  </tr>
);

const TopBottomPerformers = ({ funds }) => {
  if (!Array.isArray(funds) || funds.length === 0) {
    return null;
  }

  const recommended = funds.filter(f => f.isRecommended);
  if (recommended.length === 0) {
    return null;
  }

  const sorted = [...recommended].sort(
    (a, b) => (b.scores?.final || 0) - (a.scores?.final || 0)
  );
  const top = sorted.slice(0, 5);
  const bottom = sorted.slice(-5).reverse();

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart2 size={18} /> Top &amp; Bottom Performers
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Top 5</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Fund</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Ticker</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Class</th>
                <th style={{ textAlign: 'center', padding: '0.5rem' }}>Score</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tags</th>
                <th style={{ padding: '0.5rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {top.map(fund => (
                <FundRow key={fund.Symbol} fund={fund} />
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Bottom 5</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Fund</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Ticker</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Class</th>
                <th style={{ textAlign: 'center', padding: '0.5rem' }}>Score</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tags</th>
                <th style={{ padding: '0.5rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {bottom.map(fund => (
                <FundRow key={fund.Symbol} fund={fund} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopBottomPerformers;

