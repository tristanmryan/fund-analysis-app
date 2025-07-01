import React from 'react';
const TAG_COLOR_CLASSES = {
  Review: 'bg-red-600/20 text-red-600 border-red-600/40',
  Expensive: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40',
  Underperf: 'bg-gray-400/20 text-gray-400 border-gray-400/40',
  'High Risk': 'bg-orange-500/20 text-orange-500 border-orange-500/40',
  'Tenure Low': 'bg-gray-500/20 text-gray-500 border-gray-500/40',
  Consistent: 'bg-green-600/20 text-green-600 border-green-600/40',
  Momentum: 'bg-blue-600/20 text-blue-600 border-blue-600/40',
  'Turnaround?': 'bg-blue-500/20 text-blue-500 border-blue-500/40',
  default: 'bg-gray-500/20 text-gray-500 border-gray-500/40'
};

/**
 * Render a list of tags as small pill badges.
 * @param {Array<string>} tags
 */
const TagList = ({ tags }) => {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => {
        const classes = TAG_COLOR_CLASSES[tag] || TAG_COLOR_CLASSES.default;
        return (
          <span
            key={tag}
            className={`rounded-full border px-2 py-0.5 text-xs ${classes}`}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};

export default TagList;
