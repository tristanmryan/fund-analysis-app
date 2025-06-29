import 'fake-indexeddb/auto';
import { render } from '@testing-library/react';
import ClassView from '../ClassView.jsx';
import { useSnapshot } from '../../contexts/SnapshotContext';

jest.mock('../../contexts/SnapshotContext', () => ({
  useSnapshot: jest.fn()
}));

global.structuredClone =
  global.structuredClone || ((v) => JSON.parse(JSON.stringify(v)));

const funds = [
  { Symbol: 'IWF', fundName: 'Index', isBenchmark: true, scores: { final: 60 } },
  { Symbol: 'AAA', fundName: 'Fund A', scores: { final: 70 } }
];


test('benchmark row aligns with table', () => {
  useSnapshot.mockReturnValue({ active: { rows: funds }, setActive: jest.fn(), list: [] });
  const { asFragment } = render(
    <ClassView defaultAssetClass="Unknown" />
  );
  expect(asFragment()).toMatchSnapshot();
});
