import { render } from '@testing-library/react';
import FundTable from '../FundTable.jsx';

const sample = [{
  Symbol: 'ABC',
  fundName: 'Alpha Fund',
  assetClass: 'Large Cap',
  scores: { final: 75 },
  ytd: 2,
  oneYear: 10,
  threeYear: 12,
  fiveYear: 15,
  sharpe3y: 0.8,
  stdDev5y: 18,
  expenseRatio: 0.5,
  tags: ['outperformer']
}];

test('renders table snapshot', () => {
  const { asFragment } = render(<FundTable funds={sample} onRowClick={() => {}} />);
  expect(asFragment()).toMatchSnapshot();
});
