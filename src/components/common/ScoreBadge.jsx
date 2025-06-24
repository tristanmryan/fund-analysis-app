import React from 'react';
import { getScoreColor, getScoreLabel } from '../../services/scoring';

const levelClasses = {
  Strong: 'bg-green-100 text-green-700',
  Average: 'bg-yellow-100 text-yellow-700',
  Weak: 'bg-red-100 text-red-700'
};

/**
 * Display a score with colored pill styling.
 * @param {number} score
 * @param {string} size - small|normal|large
 */
const ScoreBadge = ({ score = 0, size = 'normal' }) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const base = 'inline-flex items-center font-medium rounded-full border';
  const sizeMap = {
    small: 'text-xs px-2 py-0.5',
    normal: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5'
  };
  const levelClass = levelClasses[label] || 'bg-gray-100 text-gray-700';

  return (
    <span
      className={`${base} ${sizeMap[size]} ${levelClass}`}
      style={{ borderColor: `${color}50` }}
    >
      {score} - {label}
    </span>
  );
};

export default ScoreBadge;
