import React, { useContext } from 'react';
import { getScoreColor as scoreColor } from '../../services/scoring';
import { Layers } from 'lucide-react';

import { getScoreColor } from '../../services/scoring';
import TagList from '../TagList.jsx';
import { LineChart, Line } from 'recharts';
import AppContext from '../../context/AppContext.jsx';

/**
 * Show summary cards for each asset class.
 *
 *  props
 *    ─ funds   : array of all loaded fund objects with scores & metrics
 *    ─ config  : object mapping asset classes to benchmark info { ticker, name }
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
          (f) => f.isRecommended && f['Asset Class'] === assetClass
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

  const recommended = funds.filter(f => f.isRecommended);
  if (recommended.length === 0) return null;

  const byClass = {};
  recommended.forEach(f => {
    const assetClass = f['Asset Class'] || 'Uncategorized';
    if (!byClass[assetClass]) byClass[assetClass] = [];
    byClass[assetClass].push(f);
  });

  const classInfo = Object.entries(byClass).map(([assetClass, classFunds]) => {
    const count = classFunds.length;
    const scoreSum = classFunds.reduce(
      (s, f) => s + (f.scores?.final || 0),
      0
    );
    const avgScore = count ? Math.round(scoreSum / count) : 0;

    const sharpe  = classFunds.map(f => f.metrics?.sharpeRatio3Y).filter(v => !isNaN(v));
    const expense = classFunds.map(f => f.metrics?.expenseRatio).filter(v => !isNaN(v));
    const std     = classFunds.map(f => f.metrics?.stdDev3Y).filter(v => !isNaN(v));

    const avgSharpe  = sharpe.length  ? (sharpe.reduce((s, v) => s + v, 0) / sharpe.length).toFixed(2)  : null;
    const avgExpense = expense.length ? (expense.reduce((s, v) => s + v, 0) / expense.length).toFixed(2) : null;
    const avgStd     = std.length     ? (std.reduce((s, v) => s + v, 0) / std.length).toFixed(2)        : null;

    const benchmarkTicker = config?.[assetClass]?.ticker || '-';
    const scoreCol        = scoreColor(avgScore);

    const trend = getTrendData(assetClass);


    const trendData = getTrendData(assetClass);

    const trendPoints = getTrendData(assetClass);

    return {
      assetClass,
      count,
      avgScore,
      avgSharpe,
      avgExpense,
      avgStd,
      benchmarkTicker,
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}
      >
        {classInfo.map(info => (
          <div
            key={info.assetClass}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              backgroundColor: `${info.color}10`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
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
