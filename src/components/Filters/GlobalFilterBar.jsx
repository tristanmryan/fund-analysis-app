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
    <div className="flex flex-wrap items-end gap-4 py-3">
      <div className="flex flex-col">
        <label className="mb-1 text-sm">
          Asset Class
        </label>
        <select
          value={selectedClass || ''}
          onChange={handleClassChange}
          className="min-w-[160px] rounded border border-gray-300 p-2"
        >
          <option value=''>All Classes</option>
          {availableClasses.slice().sort().map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-sm">
          Tags
        </label>
        <select
          multiple
          value={selectedTags}
          onChange={handleTagChange}
          className="min-w-[200px] rounded border border-gray-300 p-2"
        >
          {availableTags.slice().sort().map(tag => (
            <option key={tag} value={tag}>{formatTag(tag)}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => typeof onReset === 'function' && onReset()}
        className="rounded border border-gray-300 bg-gray-200 px-4 py-2 text-sm"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default GlobalFilterBar;
