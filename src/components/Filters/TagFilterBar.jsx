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
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'white',
        padding: '0.5rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}
    >
      {TAGS.map(tag => {
        const active = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => handleToggle(tag)}
            style={{
              cursor: 'pointer',
              borderRadius: '9999px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              border: `1px solid ${active ? '#2563eb' : '#d1d5db'}`,
              backgroundColor: active ? '#2563eb20' : 'transparent',
              color: active ? '#2563eb' : '#374151',
              fontWeight: active ? 600 : 400
            }}
          >
            {tag}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => resetFilters && resetFilters()}
        style={{
          cursor: 'pointer',
          borderRadius: '9999px',
          padding: '0.25rem 0.75rem',
          fontSize: '0.75rem',
          border: '1px solid #d1d5db'
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default TagFilterBar;
