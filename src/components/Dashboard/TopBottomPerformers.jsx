import React from 'react';
import { getScoreColor, getScoreLabel } from '@/services/scoring';
import ScoreBadge from '@/components/ScoreBadge';
import TagList from '@/components/TagList.jsx';
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
  <tr className="border-b border-gray-100">
    <td className="p-2">{fund.fundName}</td>
    <td className="p-2">{fund.Symbol}</td>
    <td className="p-2">{fund.assetClass}</td>
    <td className="p-2 text-center">
      <ScoreBadge score={fund.scores?.final || 0} />
    </td>
    <td className="p-2">
      {Array.isArray(fund.tags) && fund.tags.length > 0 ? (
        <TagList tags={fund.tags} />
      ) : (
        <span className="text-gray-400">-</span>
      )}
    </td>
    <td className="p-2">
      {fund.isBenchmark && (
        <span
          className="rounded bg-yellow-400 px-2 py-0.5 text-xs font-medium text-amber-900"
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
    <div className="mb-6">
      <h3 className="mb-2 flex items-center gap-2 text-xl font-bold">
        <BarChart2 size={18} /> Top &amp; Bottom Performers
      </h3>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        <div>
          <h4 className="mb-1 font-bold">Top 5</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="p-2 text-left">Fund</th>
                <th className="p-2 text-left">Ticker</th>
                <th className="p-2 text-left">Class</th>
                <th className="p-2 text-center">Score</th>
                <th className="p-2 text-left">Tags</th>
                <th className="p-2"></th>
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
          <h4 className="mb-1 font-bold">Bottom 5</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="p-2 text-left">Fund</th>
                <th className="p-2 text-left">Ticker</th>
                <th className="p-2 text-left">Class</th>
                <th className="p-2 text-center">Score</th>
                <th className="p-2 text-left">Tags</th>
                <th className="p-2"></th>
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

