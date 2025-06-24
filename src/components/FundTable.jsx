import React from 'react';
import TagList from './TagList.jsx';
import ScoreBadge from './common/ScoreBadge.jsx';
import { fmtPct, fmtNumber } from '../utils/formatters';

const FundTable = ({ funds = [], rows, onRowClick = () => {} }) => {
  const data = rows || funds;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-200">
          <th className="px-3 py-1 text-left font-medium">Symbol</th>
          <th className="px-3 py-1 text-left font-medium">Fund Name</th>
          <th className="px-3 py-1 text-left font-medium">Type</th>
          <th className="px-3 py-1 text-center font-medium">Score</th>
          <th className="px-3 py-1 text-right font-medium">YTD</th>
          <th className="px-3 py-1 text-right font-medium">1Y</th>
          <th className="px-3 py-1 text-right font-medium hidden sm:table-cell">3Y</th>
          <th className="px-3 py-1 text-right font-medium hidden sm:table-cell">5Y</th>
          <th className="px-3 py-1 text-right font-medium">Sharpe</th>
          <th className="px-3 py-1 text-right font-medium hidden sm:table-cell">Std Dev (5Y)</th>
          <th className="px-3 py-1 text-right font-medium hidden sm:table-cell">Expense</th>
          <th className="px-3 py-1 text-left font-medium">Tags</th>
        </tr>
      </thead>
      <tbody>
        {data.map(fund => (
          <tr
            key={fund.Symbol}
            className={`border-b cursor-pointer ${fund.isBenchmark ? 'bg-yellow-50' : ''}`}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onRowClick(fund)}
            onClick={() => onRowClick(fund)}
          >
            <td className="px-3 py-1">{fund.Symbol}</td>
            <td className="px-3 py-1">{fund['Fund Name']}</td>
            <td className="px-3 py-1">
              {fund.isBenchmark ? 'Benchmark' : fund.isRecommended ? 'Recommended' : ''}
            </td>
            <td className="px-3 py-1 text-center">
              {fund.scores ? <ScoreBadge score={fund.scores.final} /> : '-'}
            </td>
            <td className="px-3 py-1 text-right">{fmtPct(fund.ytd ?? fund.YTD)}</td>
            <td className="px-3 py-1 text-right">{fmtPct(fund.oneYear ?? fund['1 Year'])}</td>
            <td className="px-3 py-1 text-right hidden sm:table-cell">{fmtPct(fund.threeYear ?? fund['3 Year'])}</td>
            <td className="px-3 py-1 text-right hidden sm:table-cell">{fmtPct(fund.fiveYear ?? fund['5 Year'])}</td>
            <td className="px-3 py-1 text-right">{fmtNumber(fund.sharpe ?? fund['Sharpe Ratio'])}</td>
            <td className="px-3 py-1 text-right hidden sm:table-cell">{fmtPct(fund.stdDev5y ?? fund['Standard Deviation'])}</td>
            <td className="px-3 py-1 text-right hidden sm:table-cell">{fmtPct(fund.expense ?? fund['Net Expense Ratio'])}</td>
            <td className="px-3 py-1">
              {Array.isArray(fund.tags) && fund.tags.length > 0 ? (
                <TagList tags={fund.tags} />
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

export default FundTable;
