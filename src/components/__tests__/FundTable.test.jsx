import { render } from '@testing-library/react';
import FundTable from '../FundTable.jsx';

const sample = [{
  Symbol: 'ABC',
  'Fund Name': 'Alpha Fund',
  'Asset Class': 'Large Cap',
  scores: { final: 75 },
  '1 Year': 10,
  'Sharpe Ratio': 0.8,
  'Std Dev (5Y)': 15,
  Expense: 0.5,
  Type: 'MF',
  tags: ['outperformer']
}];

test('renders table snapshot', () => {
  const { asFragment } = render(<FundTable funds={sample} onRowClick={() => {}} />);
  expect(asFragment()).toMatchSnapshot();
});
