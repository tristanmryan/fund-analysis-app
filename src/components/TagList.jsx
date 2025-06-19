import React from 'react';

const TAG_COLORS = {
  underperformer: '#dc2626',
  outperformer: '#16a34a',
  'review-needed': '#eab308'
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
          <span
            key={tag}
            style={{
              backgroundColor: `${color}20`,
              color,
              border: `1px solid ${color}40`,
              borderRadius: '9999px',
              fontSize: '0.7rem',
              padding: '0.125rem 0.5rem'
            }}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};

export default TagList;
