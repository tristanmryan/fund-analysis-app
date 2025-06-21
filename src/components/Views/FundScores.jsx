import React, { useContext, useState } from 'react';
import GlobalFilterBar from '../Filters/GlobalFilterBar.jsx';
import { Download } from 'lucide-react';
import { exportToExcel } from '../../services/exportService';
import AppContext from '../../context/AppContext.jsx';
import FundDetailsModal from '../Modals/FundDetailsModal.jsx';
import ClassView from '../ClassView.jsx';

const FundScores = () => {
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

  const filteredFunds = fundData.filter(f => {
    const classMatch = selectedClass ? f.assetClass === selectedClass : true;
    const tagMatch = selectedTags.length > 0 ? selectedTags.every(t => f.tags?.includes(t)) : true;
    return classMatch && tagMatch;
  });

  const handleExport = () => {
    if (filteredFunds.length === 0) return;
    exportToExcel(filteredFunds);
  };

  const byClass = {};
  filteredFunds.forEach(f => {
    const cls = f.assetClass || 'Uncategorized';
    if (!byClass[cls]) byClass[cls] = [];
    byClass[cls].push(f);
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
        Object.entries(byClass).map(([cls, funds]) => (
          <div key={cls} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{cls}</h3>
            <ClassView funds={funds} />
          </div>
        ))
      )}

      {selectedFund && (
        <FundDetailsModal fund={selectedFund} onClose={() => setSelectedFund(null)} />
      )}
    </div>
  );
};

export default FundScores;
