import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { getScoreColor, getScoreLabel } from '../../services/scoring';

const FundDetailsModal = ({ fund, onClose }) => {
  if (!fund) return null;

  const chartData =
    (fund.history || []).map(pt => ({
      date: pt.date.slice(0, 7),
      score: pt.score
    })) || [];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: '0.5rem', padding: '1.5rem', width: '500px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          {fund.Symbol} – {fund['Fund Name']}
        </h3>
        <p style={{ marginBottom: '0.75rem', color: '#6b7280' }}>
          Asset Class: {fund.assetClass} · Score:&nbsp;
          <span style={{ color: getScoreColor(fund.scores.final) }}>
            {fund.scores.final} ({getScoreLabel(fund.scores.final)})
          </span>
        </p>

        {chartData.length > 1 && (
          <LineChart width={440} height={200} data={chartData}>
            <XAxis dataKey="date" fontSize={11} />
            <YAxis width={30} fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke={getScoreColor(fund.scores.final)} dot={false} />
          </LineChart>
        )}

        <h4 style={{ marginTop: '1rem', fontWeight: 600 }}>Key Metrics</h4>
        <ul style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
          <li>YTD: {fund['YTD'] ?? 'N/A'}%</li>
          <li>1-Year: {fund['1 Year'] ?? 'N/A'}%</li>
          <li>3-Year: {fund['3 Year'] ?? 'N/A'}%</li>
          <li>Sharpe (3Y): {fund.metrics?.sharpeRatio3Y ?? 'N/A'}</li>
          <li>Std Dev (3Y): {fund.metrics?.stdDev3Y ?? 'N/A'}</li>
          <li>Expense Ratio: {fund.metrics?.expenseRatio ?? 'N/A'}%</li>
        </ul>

        <button
          onClick={onClose}
          style={{
            marginTop: '1rem', padding: '0.5rem 1rem',
            background: '#dc2626', color: '#fff', border: 'none',
            borderRadius: '0.375rem', cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FundDetailsModal;
