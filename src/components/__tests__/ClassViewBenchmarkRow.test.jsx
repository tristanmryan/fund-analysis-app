import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassView from '../ClassView.jsx';

jest.mock('../../contexts/SnapshotContext', () => ({
  useSnapshot: jest.fn()
}));

global.structuredClone =
  global.structuredClone || ((v) => JSON.parse(JSON.stringify(v)));

const mockLargeCapGrowth = [
  {
    Symbol: 'IWF',
    'Fund Name': 'Russell 1000 Growth',
    isBenchmark: true,
    assetClass: 'Large Cap Growth',
    ytd: 1,
    oneYear: 2,
    threeYear: 3,
    fiveYear: 4,
    sharpe: 1,
    stdDev5y: 10,
    expense: 0.2,
    scores: { final: 60 }
  },
  {
    Symbol: 'AAA',
    'Fund Name': 'Fund A',
    assetClass: 'Large Cap Growth',
    ytd: 0.5,
    oneYear: 1,
    threeYear: 1.5,
    fiveYear: 2,
    sharpe: 0.8,
    stdDev5y: 12,
    expense: 0.3,
    scores: { final: 70 }
  }
];


import { useSnapshot } from '../../contexts/SnapshotContext';

test('benchmark row visible in class view', () => {
  useSnapshot.mockReturnValue({ active: { rows: mockLargeCapGrowth }, setActive: jest.fn(), list: [] });
  render(<ClassView defaultAssetClass="Large Cap Growth" />);
  expect(screen.getByText(/Benchmark — IWF/i)).toBeInTheDocument();
});

