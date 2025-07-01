import React from 'react';

const COLOR_CLASSES = {
  underperformer: 'border-red-600/50 bg-red-600/20 text-red-600',
  outperformer: 'border-green-600/50 bg-green-600/20 text-green-600',
  'review-needed': 'border-yellow-500/50 bg-yellow-500/20 text-yellow-500',
  default: 'border-gray-500/50 bg-gray-500/20 text-gray-500'
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
        const classes = COLOR_CLASSES[tag] || COLOR_CLASSES.default;

        return (
          <button
            key={tag}
            type="button"
            onClick={() => handleToggle(tag)}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${active ? `font-semibold ${classes}` : 'border-gray-300 text-gray-700 bg-transparent'}`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default TagFilterPanel;
