import React from 'react';
import BenchmarkRow from './BenchmarkRow.jsx';
import FundTable from './FundTable.jsx';

const ClassView = ({ funds = [] }) => {
  const benchmark = funds.find(r => r.isBenchmark);
  const peers = funds
    .filter(r => !r.isBenchmark)
    .sort((a, b) => (b.scores?.final || 0) - (a.scores?.final || 0));

  return (
    <div>
      {benchmark && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
          <tbody>
            <BenchmarkRow fund={benchmark} />
          </tbody>
        </table>
      )}
      <FundTable funds={peers} />
    </div>
  );
};

export default ClassView;
