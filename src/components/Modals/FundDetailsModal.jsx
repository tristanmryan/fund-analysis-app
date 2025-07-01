import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { getScoreColor, getScoreLabel } from '@/services/scoring';

const FundDetailsModal = ({ fund, onClose }) => {
  if (!fund) return null;

  const chartData =
    (fund.history || []).map(pt => ({
      date: pt.date.slice(0, 7),
      score: pt.score
    })) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <h3 className="text-xl font-semibold mb-2">
          {fund.Symbol} – {fund.fundName}
        </h3>
        <p className="mb-3 text-gray-600">
          Asset Class: {fund.assetClass} · Score:&nbsp;
          <span className={`text-[${getScoreColor(fund.score ?? fund.scores.final)}]`}>
            {(fund.score ?? fund.scores.final).toFixed(1)} ({getScoreLabel(fund.score ?? fund.scores.final)})
          </span>
        </p>

        {chartData.length > 1 && (
          <LineChart width={440} height={200} data={chartData}>
            <XAxis dataKey="date" fontSize={11} />
            <YAxis width={30} fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke={getScoreColor(fund.score ?? fund.scores.final)} dot={false} />
          </LineChart>
        )}

        <h4 className="mt-4 font-semibold">Key Metrics</h4>
        <ul className="text-sm leading-relaxed">
          <li>YTD: {fund.ytd ?? 'N/A'}%</li>
          <li>1-Year: {fund.oneYear ?? 'N/A'}%</li>
          <li>3-Year: {fund.threeYear ?? 'N/A'}%</li>
          <li>Sharpe (3Y): {fund.metrics?.sharpeRatio3Y ?? 'N/A'}</li>
          <li>Std Dev (3Y): {fund.metrics?.stdDev3Y ?? 'N/A'}</li>
          <li>Expense Ratio: {fund.metrics?.expenseRatio ?? 'N/A'}%</li>
        </ul>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FundDetailsModal;
