import React, { useContext, useState } from 'react';
import GlobalFilterBar from '@/components/Filters/GlobalFilterBar.jsx';
import TagList from '@/components/TagList.jsx';
import { Download } from 'lucide-react';
import { exportToExcel } from '@/services/exportService';
import AppContext from '@/context/AppContext.jsx';
import FundDetailsModal from '@/components/Modals/FundDetailsModal.jsx';

/* ---------- simple table component ---------- */
const FundTable = ({ funds = [], onRowClick = () => {} }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-200">
          <th className="p-3 text-left">Symbol</th>
          <th className="p-3 text-left">Fund Name</th>
          <th className="p-3 text-left">Asset Class</th>
          <th className="p-3 text-center">Score</th>
          <th className="p-3 text-left">Tags</th>
        </tr>
      </thead>
      <tbody>
        {funds.map(fund => (
          <tr
            key={fund.Symbol}
            className="cursor-pointer border-b border-gray-100"
            onClick={() => onRowClick(fund)}
          >
            <td className="p-2">{fund.Symbol}</td>
            <td className="p-2">{fund.fundName}</td>
            <td className="p-2">{fund.assetClass}</td>
            <td className="p-2 text-center">
              {fund.scores ? (
                <ScoreBadge score={fund.scores.final} />
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
            <td className="p-2">
              {Array.isArray(fund.tags) && fund.tags.length > 0 ? (
                <TagList tags={fund.tags} />
              ) : (
                <span className="text-gray-400">-</span>
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
      <div className="mb-4">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-white"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>

      {filteredFunds.length === 0 ? (
        <p className="text-gray-500">No funds match your current filter selection.</p>
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
