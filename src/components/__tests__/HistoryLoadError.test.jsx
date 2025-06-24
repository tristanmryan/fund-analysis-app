import { render, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../../context/AppContext.jsx';
let App;
import dataStore from '../../services/dataStore';
import { toast } from 'react-hot-toast';
import * as dataLoader from '../../services/dataLoader';

jest.mock('../../services/dataStore');
jest.mock('../../services/dataLoader');
jest.mock('../../services/exportService', () => ({
  exportToExcel: jest.fn(),
  exportToPDF: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: { error: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  App = require('../../App.jsx').default;
  dataLoader.getAssetClassOptions.mockReturnValue([]);
  dataLoader.loadAssetClassMap.mockResolvedValue(new Map());
});

test('error toast shown when history fails to load', async () => {
  dataStore.getAllSnapshots.mockRejectedValue(new Error('fail'));

  render(
    <AppProvider>
      <App />
    </AppProvider>
  );

  await userEvent.click(screen.getByRole('button', { name: /history/i }));

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalled();
  });
});
