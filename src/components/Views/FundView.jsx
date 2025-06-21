import React, { useContext, useState } from 'react';
import GlobalFilterBar from '../Filters/GlobalFilterBar.jsx';
import TagList from '../TagList.jsx';
import { Download } from 'lucide-react';
import { exportToExcel } from '../../services/exportService';
import { getScoreColor, getScoreLabel } from '../../services/scoring';
import AppContext from '../../context/AppContext.jsx';
import FundDetailsModal from '../Modals/FundDetailsModal.jsx';

/* ---------- simple table component ---------- */
const FundTable = ({ funds = [], onRowClick = () => {} }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ textAlign: 'left',  padding: '0.75rem' }}>Symbol</th>
          <th style={{ textAlign: 'left',  padding: '0.75rem' }}>Fund Name</th>
          <th style={{ textAlign: 'left',  padding: '0.75rem' }}>Asset Class</th>
          <th style={{ textAlign: 'center',padding: '0.75rem' }}>Score</th>
          <th style={{ textAlign: 'left',  padding: '0.75rem' }}>Tags</th>
        </tr>
      </thead>
      <tbody>
        {funds.map(fund => (
          <tr
            key={fund.Symbol}
            style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
            onClick={() => onRowClick(fund)}
          >
            <td style={{ padding: '0.5rem' }}>{fund.Symbol}</td>
            <td style={{ padding: '0.5rem' }}>{fund['Fund Name']}</td>
            <td style={{ padding: '0.5rem' }}>{fund.assetClass}</td>
            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
              {fund.scores ? (
                <span
                  style={{
                    backgroundColor: `${getScoreColor(fund.scores.final)}20`,
                    color          :  getScoreColor(fund.scores.final),
                    border         : `1px solid ${getScoreColor(fund.scores.final)}50`,
                    borderRadius   : '9999px',
                    fontSize       : '0.75rem',
                    padding        : '0.25rem 0.5rem'
                  }}
                >
                  {fund.scores.final} – {getScoreLabel(fund.scores.final)}
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

/* ---------- main FundView ---------- */
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

  const [selectedFund, setSelectedFund] = useState(null);

  /* apply filters */
  const filteredFunds = fundData.filter(f => {
    const classMatch = selectedClass ? f.assetClass === selectedClass : true;
    const tagMatch   =
      selectedTags.length > 0
        ? selectedTags.every(tag => Array.isArray(f.tags) && f.tags.includes(tag))
        : true;
    return classMatch && tagMatch;
  });

  const handleExport = () => {
    if (filteredFunds.length === 0) return;
    exportToExcel(filteredFunds);
  };

  return (
    <div>
      {/* filter bar */}
      <GlobalFilterBar
        availableClasses={availableClasses}
        availableTags={availableTags}
        selectedClass={selectedClass}
        selectedTags={selectedTags}
        onClassChange={setSelectedClass}
        onTagToggle={toggleTag}
        onReset={resetFilters}
      />
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={handleExport}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>

      {filteredFunds.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No funds match your current filter selection.</p>
      ) : (
        <FundTable funds={filteredFunds} onRowClick={setSelectedFund} />
      )}

      {selectedFund && (
        <FundDetailsModal fund={selectedFund} onClose={() => setSelectedFund(null)} />
      )}
    </div>
  );
};

export default FundView;
