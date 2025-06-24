import React from 'react';
import FundTable from './FundTable.jsx';
import './ClassView.css';

const ClassView = ({ funds = [] }) => {
  const benchmark = funds.find(r => r.isBenchmark);
  const peers = funds
    .filter(r => !r.isBenchmark)
    .sort((a, b) => (b.scores?.final || 0) - (a.scores?.final || 0));

  console.log('[ClassView] rows', funds.length, 'benchmark', benchmark);

  return (
    <div className="class-view">
      <FundTable rows={peers} benchmark={benchmark} />
    </div>
  );
};

export default ClassView;
