import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadDialog from '../components/UploadDialog';

test('UploadDialog renders and disables save initially', () => {
  render(<UploadDialog open={true} onClose={() => {}} />);
  expect(screen.getByText('Upload month-end CSV')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
});
