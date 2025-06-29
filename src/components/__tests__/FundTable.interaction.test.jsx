import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FundTable from '../FundTable.jsx';

test('row click calls handler', async () => {
  const fund = {
    Symbol: 'XYZ',
    fundName: 'XYZ Fund',
    assetClass: 'Bond',
    scores: { final: 60 },
    YTD: 1,
    '1 Year': 5,
    '3 Year': 6,
    '5 Year': 7,
    'Sharpe Ratio': 0.5,
    'Standard Deviation': 12,
    'Net Expense Ratio': 0.3,
    tags: []
  };
  const handler = jest.fn();
  render(<FundTable funds={[fund]} onRowClick={handler} />);
  await userEvent.click(screen.getByText('XYZ'));
  expect(handler).toHaveBeenCalledTimes(1);
});
