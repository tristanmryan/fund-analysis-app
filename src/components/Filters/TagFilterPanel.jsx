import React from 'react';

/**
 * Vertical panel of tag checkboxes for filtering funds by tag.
 * @param {Object} props
 * @param {string[]} props.availableTags - All possible tags to display
 * @param {string[]} props.selectedTags - Tags currently selected
 * @param {(tags: string[]) => void} props.onChange - Callback fired with updated tag array
 */
const TagFilterPanel = ({ availableTags = [], selectedTags = [], onChange }) => {
  if (!Array.isArray(availableTags) || availableTags.length === 0) return null;

  const handleToggle = tag => {
    const active = Array.isArray(selectedTags) && selectedTags.includes(tag);
    const updated = active
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    if (typeof onChange === 'function') {
      onChange(updated);
    }
  };

  const formatLabel = tag =>
    tag
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem' }}>
      {availableTags
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map(tag => {
          const checked = Array.isArray(selectedTags) && selectedTags.includes(tag);
          return (
            <label
              key={tag}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem 0',
                fontWeight: checked ? 600 : 400,
                color: checked ? '#111827' : '#374151'
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(tag)}
                style={{ marginRight: '0.5rem' }}
              />
              {formatLabel(tag)}
            </label>
          );
        })}
    </div>
  );
};

export default TagFilterPanel;
