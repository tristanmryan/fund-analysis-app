import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FundScores from '@/routes/FundScores';
import AppContext from '@/context/AppContext.jsx';
import React, { useState } from 'react';

jest.mock('@/contexts/SnapshotContext', () => ({
  useSnapshot: jest.fn()
}));
import { useSnapshot } from '@/contexts/SnapshotContext';

global.structuredClone =
  global.structuredClone || ((v) => JSON.parse(JSON.stringify(v)));

jest.mock('@/services/exportService', () => ({
  exportToExcel: jest.fn(),
}));


function Wrapper({ children }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const toggleTag = tag =>
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  const resetFilters = () => setSelectedTags([]);
  const value = {
    fundData: [
      { Symbol: 'A', fundName: 'A', assetClass: 'X', scores: { final: 50 }, tags: ['Review'] },
      { Symbol: 'B', fundName: 'B', assetClass: 'X', scores: { final: 60 }, tags: [] }
    ],
    availableClasses: ['X'],
    availableTags: ['Review'],
    selectedClass,
    setSelectedClass,
    selectedTags,
    toggleTag,
    resetFilters
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

test('filter pill toggles rows', async () => {
  useSnapshot.mockReturnValue({
    active: { rows: [
      { symbol: 'A', score: 50, assetClass: 'X', tags: ['Review'] },
      { symbol: 'B', score: 60, assetClass: 'X', tags: [] }
    ] },
    setActive: jest.fn(),
    list: []
  });
  render(
    <Wrapper>
      <FundScores />
    </Wrapper>
  );
  const table = screen.getByRole('table');
  expect(table.querySelectorAll('tbody tr').length).toBe(2);
  await userEvent.click(screen.getByRole('button', { name: 'Review' }));
  expect(table.querySelectorAll('tbody tr').length).toBe(1);
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(table.querySelectorAll('tbody tr').length).toBe(2);
});
