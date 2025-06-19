import React from 'react';

/**
 * Global filter bar for the Fund Scores view.
 * Provides drop-down selectors for asset class and tags with a reset option.
 *
 * Props:
 * - availableClasses: array of strings
 * - availableTags: array of strings
 * - selectedClass: string or null
 * - selectedTags: array of strings
 * - onClassChange(newValue)
 * - onTagToggle(tag)
 * - onReset()
 */
const GlobalFilterBar = ({
  availableClasses = [],
  availableTags = [],
  selectedClass = '',
  selectedTags = [],
  onClassChange,
  onTagToggle,
  onReset
}) => {
  const handleClassChange = (e) => {
    if (typeof onClassChange === 'function') {
      const value = e.target.value || null;
      onClassChange(value);
    }
  };

  const handleTagChange = (e) => {
    const options = Array.from(e.target.options);
    const newSelected = options.filter(o => o.selected).map(o => o.value);
    const toggled = [];
    availableTags.forEach(tag => {
      const was = selectedTags.includes(tag);
      const is = newSelected.includes(tag);
      if (was !== is) toggled.push(tag);
    });
    if (typeof onTagToggle === 'function') {
      toggled.forEach(tag => onTagToggle(tag));
    }
  };

  const formatTag = (tag) =>
    tag.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: '1rem',
        padding: '0.75rem 0'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          Asset Class
        </label>
        <select
          value={selectedClass || ''}
          onChange={handleClassChange}
          style={{
            minWidth: '160px',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem'
          }}
        >
          <option value=''>All Classes</option>
          {availableClasses.slice().sort().map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          Tags
        </label>
        <select
          multiple
          value={selectedTags}
          onChange={handleTagChange}
          style={{
            minWidth: '200px',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem'
          }}
        >
          {availableTags.slice().sort().map(tag => (
            <option key={tag} value={tag}>{formatTag(tag)}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => typeof onReset === 'function' && onReset()}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#e5e7eb',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default GlobalFilterBar;
