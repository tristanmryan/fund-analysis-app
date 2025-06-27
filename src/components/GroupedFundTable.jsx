import React, { useState } from 'react';
import BenchmarkRow from './BenchmarkRow.jsx';
import FundTable from './FundTable.jsx';

/**
 * Group funds by asset class and render expandable sections.
 * @param {Array<Object>} funds
 * @param {Function} onRowClick
 */
const GroupedFundTable = ({ funds = [], onRowClick = () => {}, deltas = {}, spark = {} }) => {
  const groups = {};
  funds.forEach(f => {
    const cls = f.assetClass || 'Uncategorized';
    if (!groups[cls]) groups[cls] = [];
    groups[cls].push(f);
  });

  const [open, setOpen] = useState({});
  const toggle = cls =>
    setOpen(prev => ({ ...prev, [cls]: !prev[cls] }));

  return (
    <div>
      {Object.entries(groups).map(([cls, rows]) => {
        const benchmark = rows.find(r => r.isBenchmark);
        const peers = rows.filter(r => !r.isBenchmark);
          const avg = peers.length
            ? Math.round(
                peers.reduce((s, f) => s + ((f.score ?? f.scores?.final) || 0), 0) / peers.length
              )
            : 0;
        const benchScore = (benchmark?.score ?? benchmark?.scores?.final) || 0;
        return (
          <div key={cls} style={{ marginBottom: '1rem' }}>
            <div
              onClick={() => toggle(cls)}
              style={{
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <span>{cls}</span>
              <span>
                Avg {avg}
                {benchScore != null && ` | Benchmark ${benchScore}`}
              </span>
            </div>
            {open[cls] && (
              <div style={{ marginTop: '0.5rem' }}>
                <FundTable rows={peers} benchmark={benchmark} onRowClick={onRowClick} deltas={deltas} spark={spark} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupedFundTable;
