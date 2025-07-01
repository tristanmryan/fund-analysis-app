import React, { useState, useMemo } from 'react';
import TagList from './TagList.jsx';
import BenchmarkRow from './BenchmarkRow.jsx';
import { fmtPct, fmtNumber } from '@/utils/formatters';
import { LABELS } from '../constants/labels';
import ScoreBadge from '@/components/ScoreBadge';
import SparkLine from './SparkLine';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


const columns = [
  { key: 'Symbol', label: 'Symbol', numeric: false },
  { key: 'fundName', label: LABELS.FUND_NAME, numeric: false },
  { key: 'Type', label: 'Type', numeric: false, accessor: f => (f.isBenchmark ? 'Benchmark' : f.isRecommended ? 'Recommended' : '') },
  { key: 'Score', label: 'Score', numeric: true, accessor: f => f.score ?? f.scores?.final },
  { key: 'Delta', label: '\u0394', numeric: true },
  { key: 'Trend', label: 'Trend', numeric: false },
  { key: 'YTD', label: 'YTD', numeric: true, accessor: f => f.ytd ?? f.YTD },
  { key: '1Y', label: '1Y', numeric: true, accessor: f => f.oneYear },
  { key: '3Y', label: '3Y', numeric: true, accessor: f => f.threeYear },
  { key: '5Y', label: '5Y', numeric: true, accessor: f => f.fiveYear },
  { key: 'Sharpe', label: 'Sharpe', numeric: true, accessor: f => f.sharpe3Y },
  { key: 'Std Dev (5Y)', label: 'Std Dev (5Y)', numeric: true, accessor: f => f.stdDev5Y },
  { key: 'Expense', label: 'Expense', numeric: true, accessor: f => f.expenseRatio },
  { key: 'Tags', label: 'Tags', numeric: false, accessor: f => f.tags }
];

const FundTable = ({ funds = [], rows, benchmark, onRowClick = () => {}, deltas = {}, spark = {} }) => {
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
      <colgroup>
        {columns.map((c, idx) => (
          <col key={idx} />
        ))}
      </colgroup>
      <thead>
        <tr className="border-b-2 border-gray-200">
          {columns.map(col => (
            <th
              key={col.key}
              onClick={() => handleSort(col.key, col.numeric)}
              className={`p-3 font-medium cursor-pointer ${col.numeric ? 'text-right' : col.key === 'Score' ? 'text-center' : 'text-left'}`}
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
            className={`border-b border-gray-100 cursor-pointer ${fund.isBenchmark ? 'bg-yellow-50' : ''}`}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onRowClick(fund)}
            onClick={() => onRowClick(fund)}
          >
            <td className="p-2">{fund.Symbol}</td>
            <td className="p-2">{fund.fundName}</td>
            <td className="p-2">
              {fund.isBenchmark ? 'Benchmark' : fund.isRecommended ? 'Recommended' : ''}
            </td>
            <td className="p-2 text-center">
              {fund.score != null
                ? <ScoreBadge score={fund.score} />
                : fund.scores
                  ? <ScoreBadge score={fund.scores.final} />
                  : '—'}
            </td>
            <td className="p-2 text-center">
              {(() => {
                const d = deltas[fund.Symbol]
                return d == null ? '' : d > 0
                  ? <><ArrowDropUpIcon color="success" fontSize="small" />{d}</>
                  : d < 0
                    ? <><ArrowDropDownIcon color="error" fontSize="small" />{Math.abs(d)}</>
                    : '—'
              })()}
            </td>
            <td className="p-2">
              <SparkLine data={spark[fund.Symbol] ?? []} />
            </td>
            <td className="p-2 text-right">
              {fmtPct(fund.ytd)}
            </td>
            <td className="p-2 text-right">
              {fmtPct(fund.oneYear)}
            </td>
            <td className="p-2 text-right">
              {fmtPct(fund.threeYear)}
            </td>
            <td className="p-2 text-right">
              {fmtPct(fund.fiveYear)}
            </td>
            <td className="p-2 text-right">
              {fmtNumber(fund.sharpe3Y)}
            </td>
            <td className="p-2 text-right">
              {fmtPct(fund.stdDev5Y)}
            </td>
            <td className="p-2 text-right">
              {fmtPct(fund.expenseRatio)}
            </td>
            <td className="p-2">
              {Array.isArray(fund.tags) && fund.tags.length > 0 ? (
                <TagList tags={fund.tags} />
              ) : (
                <span className="text-gray-400">-</span>
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
