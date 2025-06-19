import React from 'react';
import { getScoreColor } from '../../services/scoring';
import { LayoutGrid } from 'lucide-react';
import TagList from '../TagList.jsx';

/**
 * Render a heatmap of recommended fund scores grouped by asset class.
 * Expects an array of scored fund objects with fields:
 *   - Fund Name
 *   - Symbol
 *   - Asset Class
 *   - scores.final
 *   - tags (optional array of strings)
 *   - metrics (optional object with expenseRatio, managerTenure)
 *   - isRecommended
 *   - isBenchmark
 */
const ScoreBadge = ({ score }) => {
  const color = getScoreColor(score);
  return (
    <span
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}50`,
        borderRadius: '9999px',
        fontSize: '0.75rem',
        padding: '0.125rem 0.5rem',
        display: 'inline-block',
        minWidth: '2.5rem',
        textAlign: 'center'
      }}
    >
      {score}
    </span>
  );
};

const FundTile = ({ fund }) => {
  const color = getScoreColor(fund.scores?.final || 0);
  const tooltipParts = [];
  if (fund.metrics?.expenseRatio != null) {
    tooltipParts.push(`Expense Ratio: ${fund.metrics.expenseRatio}%`);
  }
  if (fund.metrics?.managerTenure != null) {
    tooltipParts.push(`Tenure: ${fund.metrics.managerTenure} yrs`);
  }

  return (
    <div
      title={tooltipParts.join(' | ')}
      style={{
        backgroundColor: `${color}20`,
        border: `1px solid ${color}50`,
        borderRadius: '0.5rem',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
      }}
    >
      <div style={{ fontWeight: 600 }}>{fund['Fund Name']}</div>
      <div style={{ fontSize: '0.875rem', color: '#374151' }}>{fund.Symbol}</div>
      <ScoreBadge score={fund.scores?.final || 0} />
      {Array.isArray(fund.tags) && fund.tags.length > 0 && (
        <TagList tags={fund.tags} />
      )}
    </div>
  );
};

const PerformanceHeatmap = ({ funds }) => {
  if (!Array.isArray(funds) || funds.length === 0) {
    return null;
  }

  const filtered = funds.filter(
    f => f.isRecommended && !f.isBenchmark
  );
  if (filtered.length === 0) {
    return null;
  }

  const byClass = {};
  filtered.forEach(f => {
    const assetClass = f['Asset Class'] || 'Uncategorized';
    if (!byClass[assetClass]) byClass[assetClass] = [];
    byClass[assetClass].push(f);
  });

  Object.values(byClass).forEach(list => {
    list.sort((a, b) => (b.scores?.final || 0) - (a.scores?.final || 0));
  });

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <LayoutGrid size={18} /> Performance Heatmap
      </h3>

      {Object.entries(byClass).map(([assetClass, classFunds]) => (
        <div key={assetClass} style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{assetClass}</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.5rem'
            }}
          >
            {classFunds.map(fund => (
              <FundTile key={fund.Symbol} fund={fund} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceHeatmap;

