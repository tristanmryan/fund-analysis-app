import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

/**
 * Display a fund's score trend over time.
 * @param {string} fundSymbol - Fund ticker symbol
 * @param {Array<Object>} dataSnapshots - Array of monthly snapshot objects
 */
const FundTimeline = ({ fundSymbol, dataSnapshots }) => {
  if (!fundSymbol || !Array.isArray(dataSnapshots) || dataSnapshots.length === 0) {
    return null;
  }

  const clean = s => s?.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  const target = clean(fundSymbol);

  const sorted = [...dataSnapshots].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = sorted.map(snapshot => {
    const fund = snapshot.funds.find(f => (f.cleanSymbol || clean(f.Symbol)) === target);
    const assetClass = fund?.assetClass;
    let benchmarkScore = null;
    if (assetClass) {
      const benchmark = snapshot.funds.find(
        f => f.isBenchmark && f.assetClass === assetClass
      );
      if (benchmark) benchmarkScore = benchmark.scores?.final ?? null;
    }

    return {
      date: new Date(snapshot.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      score: fund?.scores?.final ?? null,
      benchmark: benchmarkScore
    };
  }).filter(d => d.score != null);

  if (chartData.length === 0) {
    return <p>No history available for {fundSymbol}</p>;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="text-xl font-bold mb-2">
        Score Trend: {fundSymbol.toUpperCase()}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <ReferenceLine y={70} stroke="#16a34a" strokeDasharray="3 3" />
          <ReferenceLine y={50} stroke="#eab308" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="score" name="Score" stroke="#2563eb" dot={{ r: 3 }} />
          {chartData.some(d => d.benchmark != null) && (
            <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#6b7280" strokeDasharray="4 4" dot={{ r: 3 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FundTimeline;
