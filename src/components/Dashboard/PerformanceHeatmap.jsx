import React from 'react';
import { getScoreColor } from '../../services/scoring';
import ScoreBadge from '@/components/ScoreBadge';
import { LayoutGrid } from 'lucide-react';
import TagList from '../TagList.jsx';

/**
 * Render a heatmap of fund scores grouped by asset class.
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

const FundTile = ({ fund }) => {
  const color = getScoreColor(fund.scores?.final || 0);
  const colorClasses = {
    '#16a34a': 'border-green-600/50 bg-green-600/20',
    '#22c55e': 'border-green-500/50 bg-green-500/20',
    '#6b7280': 'border-gray-500/50 bg-gray-500/20',
    '#eab308': 'border-yellow-500/50 bg-yellow-500/20',
    '#dc2626': 'border-red-600/50 bg-red-600/20'
  };
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
      className={`flex flex-col gap-1 rounded-lg border p-2 ${colorClasses[color] || 'border-gray-200 bg-gray-200/20'}`}
    >
      <div className="font-semibold">{fund.fundName}</div>
      <div className="text-sm text-gray-700">{fund.Symbol}</div>
      <ScoreBadge score={fund.scores?.final || 0} showLabel={false} size="small" />
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

  const peers = funds.filter(f => !f.isBenchmark); // keep benchmarks
  if (peers.length === 0) {
    return null;
  }

  const byClass = {};
  peers.forEach(f => {
    const assetClass = f.assetClass || 'Uncategorized';
    if (!byClass[assetClass]) byClass[assetClass] = [];
    byClass[assetClass].push(f);
  });

  Object.values(byClass).forEach(list => {
    list.sort((a, b) => (b.scores?.final || 0) - (a.scores?.final || 0));
  });

  const benchmarks = funds.filter(f => f.isBenchmark);

  return (
    <div className="mb-6">
      <h3
        className="mb-2 flex items-center gap-2 text-xl font-bold"
      >
        <LayoutGrid size={18} /> Performance Heatmap
      </h3>

      {Object.entries(byClass).map(([assetClass, classFunds]) => {
        const benchmark = benchmarks.find(b => b.assetClass === assetClass);
        return (
          <div key={assetClass} className="mb-4">
            <h4 className="mb-1 font-bold">{assetClass}</h4>
            <div
              className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]"
            >
              {benchmark && <FundTile key={benchmark.Symbol} fund={benchmark} />}
              {classFunds.map(fund => (
                <FundTile key={fund.Symbol} fund={fund} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceHeatmap;

