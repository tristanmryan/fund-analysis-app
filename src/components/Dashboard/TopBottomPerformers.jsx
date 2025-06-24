import React from 'react';
import TagList from '../TagList.jsx';
import ScoreBadge from '../common/ScoreBadge.jsx';
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

const FundRow = ({ fund }) => (
  <tr className="border-b">
    <td className="px-3 py-1">{fund['Fund Name']}</td>
    <td className="px-3 py-1">{fund.Symbol}</td>
    <td className="px-3 py-1">{fund.assetClass}</td>
    <td className="px-3 py-1 text-center">
      <ScoreBadge score={fund.scores?.final || 0} />
    </td>
    <td className="px-3 py-1">
      {Array.isArray(fund.tags) && fund.tags.length > 0 ? (
        <TagList tags={fund.tags} />
      ) : (
        <span className="text-gray-400">-</span>
      )}
    </td>
    <td className="px-3 py-1">
      {fund.isBenchmark && (
        <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Top 5</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-3 py-1 text-left">Fund</th>
                <th className="px-3 py-1 text-left">Ticker</th>
                <th className="px-3 py-1 text-left">Class</th>
                <th className="px-3 py-1 text-center">Score</th>
                <th className="px-3 py-1 text-left">Tags</th>
                <th className="px-3 py-1"></th>
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-3 py-1 text-left">Fund</th>
                <th className="px-3 py-1 text-left">Ticker</th>
                <th className="px-3 py-1 text-left">Class</th>
                <th className="px-3 py-1 text-center">Score</th>
                <th className="px-3 py-1 text-left">Tags</th>
                <th className="px-3 py-1"></th>
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

