import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadDialog from '../components/UploadDialog';
import { SnapshotProvider } from '../contexts/SnapshotContext';

test('UploadDialog renders and disables save initially', () => {
  render(
    <SnapshotProvider>
      <UploadDialog open={true} onClose={() => {}} />
    </SnapshotProvider>
  );
  expect(screen.getByText('Upload month-end CSV')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
});
