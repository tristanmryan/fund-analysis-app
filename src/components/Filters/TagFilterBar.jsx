import React, { useContext } from 'react';
import AppContext from '../../context/AppContext.jsx';

const TAGS = [
  'Review',
  'Expensive',
  'Underperf',
  'High Risk',
  'Tenure Low',
  'Consistent',
  'Momentum',
  'Turnaround?'
];

const TagFilterBar = () => {
  const { selectedTags = [], toggleTag, resetFilters } = useContext(AppContext);

  const handleToggle = tag => {
    if (typeof toggleTag === 'function') toggleTag(tag);
  };

  return (
    <div className="sticky top-0 z-20 flex flex-wrap gap-2 border-b border-gray-200 bg-white p-2">
      {TAGS.map(tag => {
        const active = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => handleToggle(tag)}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${active ? 'border-blue-600 bg-blue-600/20 text-blue-600 font-semibold' : 'border-gray-300 text-gray-700'}`}
          >
            {tag}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => resetFilters && resetFilters()}
        className="cursor-pointer rounded-full border border-gray-300 px-3 py-1 text-xs"
      >
        Clear
      </button>
    </div>
  );
};

export default TagFilterBar;
