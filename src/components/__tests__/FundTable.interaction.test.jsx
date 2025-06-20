import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FundTable from '../FundTable.jsx';

test('row click calls handler', async () => {
  const fund = {
    Symbol: 'XYZ',
    'Fund Name': 'XYZ Fund',
    'Asset Class': 'Bond',
    scores: { final: 60 },
    '1 Year': 5,
    'Sharpe Ratio': 0.5,
    'Std Dev (5Y)': 12,
    Expense: 0.3,
    Type: 'ETF',
    tags: []
  };
  const handler = jest.fn();
  render(<FundTable funds={[fund]} onRowClick={handler} />);
  await userEvent.click(screen.getByText('XYZ'));
  expect(handler).toHaveBeenCalledTimes(1);
});
