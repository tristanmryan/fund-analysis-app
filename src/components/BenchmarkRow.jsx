import React from 'react';
import { getScoreColor, getScoreLabel } from '../utils/scoreTags';
import { fmtPct, fmtNumber } from '../utils/formatters';

const COLOR_MAP = {
  '#16a34a': 'green-600',
  '#22c55e': 'green-500',
  '#6b7280': 'gray-500',
  '#eab308': 'yellow-500',
  '#dc2626': 'red-600'
};

const ScoreBadge = ({ score }) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const tone = COLOR_MAP[color] || 'gray-500';
  return (
    <span
      className={`inline-block min-w-[3rem] rounded-full border px-2 py-1 text-center text-xs font-bold bg-${tone}/20 border-${tone}/50 text-${tone}`}
    >
      {Number(score).toFixed(1)} - {label}
    </span>
  );
};

const BenchmarkRow = ({ fund }) => {
  const row = fund;
  if (!row) return null;
  return (
    <tr className="benchmark-banner">
      <td className="p-3">{`Benchmark — ${row.Symbol}`}</td>
      <td className="p-3">{row.fundName || row.name}</td>
      <td className="p-3">Benchmark</td>
      <td className="p-3 text-center">
        {row.score != null
          ? <ScoreBadge score={row.score} />
          : row.scores
            ? <ScoreBadge score={row.scores.final} />
            : '-'}
      </td>
      <td className="p-3"></td>
      <td className="p-3"></td>
      <td className="p-3 text-right">
        {fmtPct(row.ytd ?? row.YTD)}
      </td>
      <td className="p-3 text-right">
        {fmtPct(row.oneYear)}
      </td>
      <td className="p-3 text-right">
        {fmtPct(row.threeYear)}
      </td>
      <td className="p-3 text-right">
        {fmtPct(row.fiveYear)}
      </td>
      <td className="p-3 text-right">
        {fmtNumber(row.sharpe3y)}
      </td>
      <td className="p-3 text-right">
        {fmtPct(row.stdDev5y)}
      </td>
      <td className="p-3 text-right">
        {fmtPct(row.expenseRatio)}
      </td>
      <td className="p-3"></td>
    </tr>
  );
};

export default BenchmarkRow;
