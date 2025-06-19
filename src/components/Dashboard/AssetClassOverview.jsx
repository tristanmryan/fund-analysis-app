import React from 'react';
import { getScoreColor } from '../../services/scoring';
import { Layers } from 'lucide-react';
import TagList from '../TagList.jsx';

/**
 * Show summary cards for each asset class.
 * Expects props:
 *  - funds: array of all loaded fund objects with scores and metrics
 *  - config: object mapping asset classes to benchmark info { ticker, name }
 */
const AssetClassOverview = ({ funds, config }) => {
  if (!Array.isArray(funds) || funds.length === 0) {
    return null;
  }

  const recommended = funds.filter(f => f.isRecommended);
  if (recommended.length === 0) {
    return null;
  }

  const byClass = {};
  recommended.forEach(f => {
    const assetClass = f['Asset Class'] || 'Uncategorized';
    if (!byClass[assetClass]) byClass[assetClass] = [];
    byClass[assetClass].push(f);
  });

  const classInfo = Object.entries(byClass).map(([assetClass, classFunds]) => {
    const count = classFunds.length;
    const scoreSum = classFunds.reduce((sum, f) => sum + (f.scores?.final || 0), 0);
    const avgScore = count > 0 ? Math.round(scoreSum / count) : 0;

    // Optional metrics
    const sharpeValues = classFunds
      .map(f => f.metrics?.sharpeRatio3Y)
      .filter(v => v != null && !isNaN(v));
    const avgSharpe =
      sharpeValues.length > 0
        ? (sharpeValues.reduce((s, v) => s + v, 0) / sharpeValues.length).toFixed(2)
        : null;

    const expenseValues = classFunds
      .map(f => f.metrics?.expenseRatio)
      .filter(v => v != null && !isNaN(v));
    const avgExpense =
      expenseValues.length > 0
        ? (expenseValues.reduce((s, v) => s + v, 0) / expenseValues.length).toFixed(2)
        : null;

    const stdValues = classFunds
      .map(f => f.metrics?.stdDev3Y)
      .filter(v => v != null && !isNaN(v));
    const avgStd =
      stdValues.length > 0
        ? (stdValues.reduce((s, v) => s + v, 0) / stdValues.length).toFixed(2)
        : null;

    const benchmarkTicker = config?.[assetClass]?.ticker || '-';
    const color = getScoreColor(avgScore);
    const tags = Array.from(
      new Set(
        classFunds.flatMap(f => (Array.isArray(f.tags) ? f.tags : []))
      )
    );

    return {
      assetClass,
      count,
      avgScore,
      avgSharpe,
      avgExpense,
      avgStd,
      benchmarkTicker,
      color,
      tags,
    };
  });

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Layers size={18} /> Asset Class Overview
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
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
              gap: '0.25rem',
            }}
          >
            <div style={{ fontWeight: 600 }}>{info.assetClass}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Funds: {info.count}</span>
              <span style={{ color: info.color }}>Avg {info.avgScore}</span>
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
