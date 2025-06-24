import React, { useContext } from 'react';
import { getScoreColor as scoreColor } from '../../services/scoring';
import { Layers } from 'lucide-react';
import TagList from '../TagList.jsx';
import { LineChart, Line } from 'recharts';
import AppContext from '../../context/AppContext.jsx';
import './AssetClassOverview.css';

/**
 * Show summary cards for each asset class.
 *  - funds   : array of all loaded fund objects with scores and metrics
 *  - config  : object mapping asset classes to benchmark info { ticker, name }
 */
const AssetClassOverview = ({ funds, config }) => {
  const { historySnapshots } = useContext(AppContext);
  if (!Array.isArray(funds) || funds.length === 0) {
    return <p style={{ color: '#6b7280' }}>No data loaded yet.</p>;
  }

  const getTrendData = (assetClass) => {
    return historySnapshots
      .slice(-6)
      .map((snap) => {
        const rec = snap.funds.filter(
          (f) => f.isRecommended && f.assetClass === assetClass
        );
        const avg = rec.length
          ? Math.round(
              rec.reduce((sum, f) => sum + (f.scores?.final || 0), 0) /
                rec.length
            )
          : null;
        return { date: snap.date, value: avg };
      })
      .filter((d) => d.value !== null);
  };

  // Use all funds; peers exclude benchmarks locally
  const inputFunds = funds;

  /* ---------- group funds by asset class ---------- */
  const byClass = {};
  inputFunds.forEach(f => {
    const assetClass = f.assetClass || 'Uncategorized';
    if (!byClass[assetClass]) byClass[assetClass] = [];
    byClass[assetClass].push(f);
  });

  /* ---------- build summary info per class ---------- */
  const classInfo = Object.entries(byClass).map(([assetClass, classFunds]) => {
    const count     = classFunds.length;
    const scoreSum  = classFunds.reduce((s, f) => s + (f.scores?.final || 0), 0);
    const avgScore  = count ? Math.round(scoreSum / count) : 0;

    const sharpeVals  = classFunds.map(f => f.metrics?.sharpeRatio3Y).filter(v => v != null && !isNaN(v));
    const expenseVals = classFunds.map(f => f.metrics?.expenseRatio).filter(v => v != null && !isNaN(v));
    const stdVals     = classFunds.map(f => f.metrics?.stdDev3Y).filter(v => v != null && !isNaN(v));

    const avgSharpe  = sharpeVals.length  ? (sharpeVals.reduce((s, v)  => s + v, 0) / sharpeVals.length ).toFixed(2) : null;
    const avgExpense = expenseVals.length ? (expenseVals.reduce((s, v) => s + v, 0) / expenseVals.length).toFixed(2) : null;
    const avgStd     = stdVals.length     ? (stdVals.reduce((s, v)     => s + v, 0) / stdVals.length    ).toFixed(2) : null;

    const benchmarkTicker = config?.[assetClass]?.ticker || '-';
    const benchmarkFund   = classFunds.find(f => f.isBenchmark);
    const benchmarkScore  = benchmarkFund?.scores?.final ?? null;
    const scoreCol        = scoreColor(avgScore);

    const tags = Array.from(
      new Set(classFunds.flatMap(f => (Array.isArray(f.tags) ? f.tags : [])))
    );

    const trendPoints = getTrendData(assetClass);

    return {
      assetClass,
      count,
      avgScore,
      avgSharpe,
      avgExpense,
      avgStd,
      benchmarkTicker,
      benchmarkScore,
      color: scoreCol,
      tags,
      trend: trendPoints
    };
  });

  /* ---------- render ---------- */
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <Layers size={18} /> Asset Class Overview
      </h3>

      <div className="dashboard-grid grid grid-cols-2 md:grid-cols-4 gap-4">
        {classInfo.map(info => (
          <div
            key={info.assetClass}
            className="shadow-sm rounded-xl p-4 bg-white flex flex-col gap-1"
            style={{ backgroundColor: `${info.color}10` }}
          >
            <div style={{ fontWeight: 600 }}>{info.assetClass}</div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Funds: {info.count}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: info.color }}>Avg {info.avgScore}</span>
                {info.trend && info.trend.length > 0 && (
                  <LineChart width={120} height={30} data={info.trend}>
                    <Line type="monotone" dataKey="value" stroke={info.color} dot={false} />
                  </LineChart>
                )}
              </div>
            </div>

            {info.avgSharpe && (
              <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                Sharpe: {info.avgSharpe}
              </div>
            )}
            {info.avgExpense && (
              <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                Expense: {info.avgExpense}%
              </div>
            )}
            {info.avgStd && (
              <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                Std Dev: {info.avgStd}
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Benchmark: {info.benchmarkTicker}
              {info.benchmarkScore != null && (
                <span style={{ marginLeft: '0.25rem', color: info.color }}>
                  ({info.benchmarkScore})
                </span>
              )}
            </div>

            {info.tags.length > 0 && (
              <div style={{ marginTop: '0.25rem' }}>
                <TagList tags={info.tags} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetClassOverview;
