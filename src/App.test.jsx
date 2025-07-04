import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppProvider } from './context/AppContext.jsx';
import { SnapshotProvider } from './contexts/SnapshotContext';
let App;
import { loadAssetClassMap } from './services/dataLoader';
import { toast } from 'react-hot-toast';

jest.mock('./services/dataLoader', () => ({
  loadAssetClassMap: jest.fn(),
  getAssetClassOptions: jest.fn(() => []),
}));
jest.mock('./services/exportService', () => ({
  exportToExcel: jest.fn(),
  exportToPDF: jest.fn(),
}));
jest.mock('./services/pdfExport', () => ({
  buildSnapshotPdf: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: { error: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  App = require('./App.jsx').default;
});

test('shows toast when asset class map fails to load', async () => {
  loadAssetClassMap.mockRejectedValue(new Error('fail'));

  render(
    <SnapshotProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </SnapshotProvider>
  );

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalled();
  });
});
