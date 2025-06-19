import React, { useContext } from 'react';
import GlobalFilterBar from '../Filters/GlobalFilterBar.jsx';
import TagList from '../TagList.jsx';
import { getScoreColor, getScoreLabel } from '../../services/scoring';
import AppContext from '../../context/AppContext.jsx';

// Basic table for displaying fund data
const FundTable = ({ funds = [] }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>Symbol</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>Fund Name</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>Asset Class</th>
            <th style={{ textAlign: 'center', padding: '0.75rem' }}>Score</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>Tags</th>
          </tr>
        </thead>
        <tbody>
          {funds.map(fund => (
            <tr key={fund.Symbol} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '0.5rem' }}>{fund.Symbol}</td>
              <td style={{ padding: '0.5rem' }}>{fund['Fund Name']}</td>
              <td style={{ padding: '0.5rem' }}>{fund['Asset Class']}</td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                {fund.scores ? (
                  <span
                    style={{
                      backgroundColor: `${getScoreColor(fund.scores.final)}20`,
                      color: getScoreColor(fund.scores.final),
                      border: `1px solid ${getScoreColor(fund.scores.final)}50`,
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    {fund.scores.final} - {getScoreLabel(fund.scores.final)}
                  </span>
                ) : (
                  <span style={{ color: '#9ca3af' }}>-</span>
                )}
              </td>
              <td style={{ padding: '0.5rem' }}>
                {Array.isArray(fund.tags) && fund.tags.length > 0 ? (
                  <TagList tags={fund.tags} />
                ) : (
                  <span style={{ color: '#9ca3af' }}>-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Main FundView component showing a filter bar and table of funds.
 * Uses AppContext for filter state and fund data.
 */
const FundView = () => {
  const {
    fundData,
    availableClasses,
    availableTags,
    selectedClass,
    selectedTags,
    setSelectedClass,
    toggleTag,
    resetFilters
  } = useContext(AppContext);

  const filteredFunds = fundData.filter(f => {
    const classMatch = selectedClass ? f['Asset Class'] === selectedClass : true;
    const tagMatch =
      selectedTags && selectedTags.length > 0
        ? selectedTags.every(tag => Array.isArray(f.tags) && f.tags.includes(tag))
        : true;
    return classMatch && tagMatch;
  });

  return (
    <div>
      <GlobalFilterBar
        availableClasses={availableClasses}
        availableTags={availableTags}
        selectedClass={selectedClass}
        selectedTags={selectedTags}
        onClassChange={setSelectedClass}
        onTagToggle={toggleTag}
        onReset={resetFilters}
      />
      <FundTable funds={filteredFunds} />
    </div>
  );
};

export default FundView;
