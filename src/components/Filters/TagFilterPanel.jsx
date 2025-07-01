import React from 'react';

const TAG_COLORS = {
  underperformer : '#dc2626',
  outperformer   : '#16a34a',
  'review-needed': '#eab308'
};

/**
 * Tag filter panel with toggleable tag pills.
 *
 * @param {Object}   props
 * @param {string[]} props.availableTags  All tags that can be toggled
 * @param {string[]} props.selectedTags   Currently selected tags
 * @param {Function} props.onToggleTag    Handler invoked with a tag when toggled
 */
const TagFilterPanel = ({ availableTags = [], selectedTags = [], onToggleTag }) => {
  if (!Array.isArray(availableTags) || availableTags.length === 0) return null;

  const handleToggle = tag => {
    if (typeof onToggleTag === 'function') onToggleTag(tag);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {availableTags.map(tag => {
        const active = Array.isArray(selectedTags) && selectedTags.includes(tag);
        const color  = TAG_COLORS[tag] || '#6b7280';

        return (
          <button
            key={tag}
            type="button"
            onClick={() => handleToggle(tag)}
            style={{
              borderColor: active ? color : '#d1d5db',
              backgroundColor: active ? `${color}20` : 'transparent',
              color: active ? color : '#374151'
            }}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${active ? 'font-semibold' : ''}`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default TagFilterPanel;
