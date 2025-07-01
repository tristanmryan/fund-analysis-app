import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/context/AppContext.jsx';
import { SnapshotProvider } from '@/contexts/SnapshotContext';
let App;
import * as dataLoader from '@/services/dataLoader';

jest.mock('@/services/dataLoader');
jest.mock('@/services/exportService', () => ({
  exportToExcel: jest.fn(),
  exportToPDF: jest.fn(),
}));


beforeEach(() => {
  jest.clearAllMocks();
  App = require('@/App.jsx').default;
  dataLoader.getAssetClassOptions.mockReturnValue([]);
  dataLoader.loadAssetClassMap.mockResolvedValue(new Map());
});

test('history view renders manager', async () => {
  render(
    <AppProvider>
      <SnapshotProvider>
        <App />
      </SnapshotProvider>
    </AppProvider>
  );

  await userEvent.click(screen.getByRole('button', { name: /history/i }));

  expect(await screen.findByText(/historical data manager/i)).toBeInTheDocument();
});
