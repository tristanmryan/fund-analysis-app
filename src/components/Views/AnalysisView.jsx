import React, { useState, useMemo } from 'react';
import ScoreBadge from '@/components/ScoreBadge';
import { fmtPct, fmtNumber } from '@/utils/formatters';
import { getClassesWhereBenchmarkLeads } from '@/selectors/benchmarkLead';
import HeatMapGrid from '@/components/HeatMapGrid.jsx';


const AnalysisView = ({ funds = [], reviewCandidates = [], onSelectClass }) => {
  const [gap, setGap] = useState(5);
  const [sort, setSort] = useState({ key: 'gap', dir: 'desc', numeric: true });
  const [view, setView] = useState('heatmap');

  const leadData = useMemo(
    () => getClassesWhereBenchmarkLeads(funds, Number(gap)),
    [funds, gap]
  );

  const sorted = useMemo(() => {
    const data = [...leadData];
    data.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (sort.numeric) {
        return sort.dir === 'asc' ? av - bv : bv - av;
      }
      const as = String(av).toUpperCase();
      const bs = String(bv).toUpperCase();
      if (as < bs) return sort.dir === 'asc' ? -1 : 1;
      if (as > bs) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [leadData, sort]);

  const handleSort = (key, numeric) => {
    let dir = 'asc';
    if (sort.key === key) {
      dir = sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      dir = numeric ? 'desc' : 'asc';
    }
    setSort({ key, dir, numeric });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Benchmark Leaders</h2>
      <div className="flex items-center gap-2 mb-4 text-sm">
        <label htmlFor="gapInput" className="inline-flex items-center gap-1">
          Show classes where Bench &gt; Median by ≥
          <input
            id="gapInput"
            type="number"
            className="border rounded px-1 py-0.5 w-16 text-right"
            value={gap}
            onChange={e => setGap(Number(e.target.value))}
          />
          pts
        </label>
        <button
          type="button"
          aria-label="toggle view"
          onClick={() => setView(v => (v === 'heatmap' ? 'table' : 'heatmap'))}
          className="ml-auto border rounded px-2 py-1"
        >
          ▢ Table / ▦ Heat Map
        </button>
      </div>
      {view === 'heatmap' ? (
        <HeatMapGrid rows={sorted} onSelect={onSelectClass} />
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border-collapse" role="table">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('assetClass', false)}>Asset Class</th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('benchmarkSymbol', false)}>Benchmark</th>
                <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('benchmarkScore', true)}>Bench. Score</th>
                <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('medianPeerScore', true)}>Median Peer</th>
                <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('gap', true)}>Gap</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(row => (
                <tr
                  key={row.assetClass}
                  className="border-b cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectClass && onSelectClass(row.assetClass)}
                >
                  <td className="p-2">{row.assetClass}</td>
                  <td className="p-2">{row.benchmarkSymbol}</td>
                  <td className="p-2 text-right">{row.benchmarkScore.toFixed(1)}</td>
                  <td className="p-2 text-right">{row.medianPeerScore.toFixed(1)}</td>
                  <td className="p-2 text-right">+{row.gap.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <details open={reviewCandidates.length > 0} className="mt-4">
        <summary className="cursor-pointer font-medium mb-2">
          Flagged Funds
          <span className="ml-1 inline-block rounded-full bg-red-600 text-white px-2 text-xs">
            {reviewCandidates.length}
          </span>
        </summary>
        {reviewCandidates.length > 0 && (
          <div className="grid gap-4 mt-2">
            {reviewCandidates.map((fund, i) => (
              <div key={i} className={`border rounded p-4 ${fund.isRecommended ? 'bg-red-50' : 'bg-white'}`}>
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{fund.fundName}</h3>
                    <p className="text-sm text-gray-600">{fund.Symbol} | {fund.assetClass}{fund.isRecommended && (
                      <span className="ml-1 text-red-600 font-bold">(Recommended Fund)</span>
                    )}</p>
                  </div>
                  <ScoreBadge score={fund.scores?.final || 0} />
                </div>
                <div>
                  <strong className="text-sm">Review Reasons:</strong>
                  <ul className="list-disc ml-6 text-sm text-red-600 mt-1">
                    {fund.reviewReasons.map((reason, j) => (
                      <li key={j}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                  <div><span className="text-gray-600">1Y Return:</span> <strong>{fmtPct(fund.oneYear)}</strong></div>
                  <div><span className="text-gray-600">Sharpe:</span> <strong>{fmtNumber(fund.sharpe3Y)}</strong></div>
                  <div><span className="text-gray-600">Expense:</span> <strong>{fmtPct(fund.expenseRatio)}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </details>
    </div>
  );
};

export default AnalysisView;
