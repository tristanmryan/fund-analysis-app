import React from 'react';
import BenchmarkRow from './BenchmarkRow.jsx';
import FundTable from './FundTable.jsx';
import './ClassView.css';

const ClassView = ({ funds = [] }) => {
  const benchmark = funds.find(r => r.isBenchmark);
  const peers = funds.filter(r => !r.isBenchmark);

  console.log('[ClassView] rows', funds.length, 'benchmark', benchmark);

  return (
    <div className="class-view">
      {benchmark && <BenchmarkRow fund={benchmark} key="benchmark-row" />}
      <FundTable rows={peers} />
    </div>
  );
};

export default ClassView;
