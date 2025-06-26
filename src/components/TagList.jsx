import React from 'react';
import Chip from '@mui/material/Chip';

const TAG_COLORS = {
  Review: '#dc2626',
  Expensive: '#eab308',
  Underperf: '#9ca3af',
  'High Risk': '#f97316',
  'Tenure Low': '#6b7280',
  Consistent: '#16a34a',
  Momentum: '#2563eb',
  'Turnaround?': '#3b82f6'
};

/**
 * Render a list of tags as small pill badges.
 * @param {Array<string>} tags
 */
const TagList = ({ tags }) => {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
      {tags.map(tag => {
        const color = TAG_COLORS[tag] || '#6b7280';
        return (
          <Chip
            key={tag}
            label={tag}
            size="small"
            style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}
            variant="outlined"
          />
        );
      })}
    </div>
  );
};

export default TagList;
