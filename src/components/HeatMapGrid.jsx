import React from 'react';

const gapColor = gap => {
  if (gap >= 10) return 'bg-green-500 text-white';
  if (gap >= 5) return 'bg-green-300';
  if (gap >= 0) return 'bg-slate-200';
  return 'bg-red-300';
};

const HeatMapGrid = ({ rows = [], onSelect }) => {
  if (!rows.length) return null;
  return (
    <div data-testid="heatmap">
      <div className="grid grid-cols-4 font-semibold border-b text-sm" role="row">
        <div className="p-2">Asset Class</div>
        <div className="p-2 text-right">Benchmark Score</div>
        <div className="p-2 text-right">Median Peer</div>
        <div className="p-2 text-right">Gap</div>
      </div>
      {rows.map(row => (
        <div
          key={row.assetClass}
          role="row"
          className="grid grid-cols-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
          onClick={() => onSelect && onSelect(row.assetClass)}
        >
          <div className="p-2">{row.assetClass}</div>
          <div className="p-2 text-right">{row.benchmarkScore.toFixed(1)}</div>
          <div className="p-2 text-right">{row.medianPeerScore.toFixed(1)}</div>
          <div
            className={`p-2 text-right ${gapColor(row.gap)}`}
            title={`${row.benchmarkScore.toFixed(1)} vs ${row.medianPeerScore.toFixed(1)}`}
          >
            {row.gap >= 0 ? '+' : ''}{row.gap.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeatMapGrid;
