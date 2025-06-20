import { render } from '@testing-library/react';
import FundTable from '../FundTable.jsx';

const sample = [{
  Symbol: 'ABC',
  'Fund Name': 'Alpha Fund',
  'Asset Class': 'Large Cap',
  scores: { final: 75 },
  YTD: 2,
  '1 Year': 10,
  '3 Year': 12,
  '5 Year': 15,
  'Sharpe Ratio': 0.8,
  'Standard Deviation': 18,
  'Net Expense Ratio': 0.5,
  tags: ['outperformer']
}];

test('renders table snapshot', () => {
  const { asFragment } = render(<FundTable funds={sample} onRowClick={() => {}} />);
  expect(asFragment()).toMatchSnapshot();
});
