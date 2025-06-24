import React, { useState, useMemo } from 'react';
import TagList from './TagList.jsx';
import BenchmarkRow from './BenchmarkRow.jsx';
import { getScoreColor, getScoreLabel } from '../utils/scoreTags';
import { fmtPct, fmtNumber } from '../utils/formatters';

const ScoreBadge = ({ score }) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  return (
    <span
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}50`,
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        padding: '0.25rem 0.5rem',
        display: 'inline-block',
        minWidth: '3rem',
        textAlign: 'center'
      }}
    >
      {score} - {label}
    </span>
  );
};

const columns = [
  { key: 'Symbol', label: 'Symbol', numeric: false },
  { key: 'Fund Name', label: 'Fund Name', numeric: false },
  { key: 'Type', label: 'Type', numeric: false, accessor: f => (f.isBenchmark ? 'Benchmark' : f.isRecommended ? 'Recommended' : '') },
  { key: 'Score', label: 'Score', numeric: true, accessor: f => f.scores?.final },
  { key: 'YTD', label: 'YTD', numeric: true, accessor: f => f.ytd ?? f.YTD },
  { key: '1Y', label: '1Y', numeric: true, accessor: f => f.oneYear ?? f['1 Year'] },
  { key: '3Y', label: '3Y', numeric: true, accessor: f => f.threeYear ?? f['3 Year'] },
  { key: '5Y', label: '5Y', numeric: true, accessor: f => f.fiveYear ?? f['5 Year'] },
  { key: 'Sharpe', label: 'Sharpe', numeric: true, accessor: f => f.sharpe ?? f['Sharpe Ratio'] },
  { key: 'Std Dev (5Y)', label: 'Std Dev (5Y)', numeric: true, accessor: f => f.stdDev5y ?? f['Standard Deviation'] },
  { key: 'Expense', label: 'Expense', numeric: true, accessor: f => f.expense ?? f['Net Expense Ratio'] },
  { key: 'Tags', label: 'Tags', numeric: false, accessor: f => f.tags }
];

const FundTable = ({ funds = [], rows, benchmark, onRowClick = () => {} }) => {
  const data = rows || funds;
  const [sort, setSort] = useState({ key: null, dir: 'asc', numeric: false });

  const handleSort = (key, numeric) => {
    let dir = 'asc';
    if (sort.key === key) {
      dir = sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      dir = numeric ? 'desc' : 'asc';
    }
    setSort({ key, dir, numeric });
  };

  const sorted = useMemo(() => {
    if (!sort.key) return data;
    const col = columns.find(c => c.key === sort.key);
    const accessor = col.accessor || (row => row[sort.key]);
    const copy = [...data];
    copy.sort((a, b) => {
      const aVal = accessor(a);
      const bVal = accessor(b);
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (sort.numeric) {
        return sort.dir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toUpperCase();
      const bStr = String(bVal).toUpperCase();
      if (aStr < bStr) return sort.dir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sort]);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <colgroup>
        {columns.map((c, idx) => (
          <col key={idx} />
        ))}
      </colgroup>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          {columns.map(col => (
            <th
              key={col.key}
              onClick={() => handleSort(col.key, col.numeric)}
              style={{ padding: '0.75rem', textAlign: col.numeric ? 'right' : col.key === 'Score' ? 'center' : 'left', fontWeight: 500, cursor: 'pointer' }}
            >
              {col.label}
              {sort.key === col.key && (sort.dir === 'asc' ? ' ▲' : ' ▼')}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {benchmark && <BenchmarkRow fund={benchmark} />}
        {sorted.map(fund => (
          <tr
            key={fund.Symbol}
            style={{
              borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer',
              backgroundColor: fund.isBenchmark ? '#fffbeb' : 'transparent'
            }}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onRowClick(fund)}
            onClick={() => onRowClick(fund)}
          >
            <td style={{ padding: '0.5rem' }}>{fund.Symbol}</td>
            <td style={{ padding: '0.5rem' }}>{fund['Fund Name']}</td>
            <td style={{ padding: '0.5rem' }}>
              {fund.isBenchmark ? 'Benchmark' : fund.isRecommended ? 'Recommended' : ''}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
              {fund.scores ? <ScoreBadge score={fund.scores.final} /> : '-'}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.ytd ?? fund.YTD)}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.oneYear ?? fund['1 Year'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.threeYear ?? fund['3 Year'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.fiveYear ?? fund['5 Year'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtNumber(fund.sharpe ?? fund['Sharpe Ratio'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.stdDev5y ?? fund['Standard Deviation'])}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              {fmtPct(fund.expense ?? fund['Net Expense Ratio'])}
            </td>
            <td style={{ padding: '0.5rem' }}>
              {Array.isArray(fund.tags) && fund.tags.length > 0 ? (
                <TagList tags={fund.tags} />
              ) : (
                <span style={{ color: '#9ca3af' }}>-</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

export default FundTable;
