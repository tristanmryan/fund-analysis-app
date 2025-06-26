import { render } from '@testing-library/react';
import ClassView from '../ClassView.jsx';
import { useSnapshot } from '../../contexts/SnapshotContext';
jest.mock('../../contexts/SnapshotContext', () => ({ useSnapshot: jest.fn() }))

const funds = [
  { Symbol: 'IWF', 'Fund Name': 'Index', assetClass: 'Large Cap Growth', isBenchmark: true, scores: { final: 60 } },
  { Symbol: 'AAA', 'Fund Name': 'Fund A', assetClass: 'Large Cap Growth', scores: { final: 70 } }
];

test('benchmark row aligns with table', () => {
  useSnapshot.mockReturnValue({ active: { rows: funds } })
  const { asFragment } = render(<ClassView defaultAssetClass="Large Cap Growth" />);
  expect(asFragment()).toMatchSnapshot();
});
