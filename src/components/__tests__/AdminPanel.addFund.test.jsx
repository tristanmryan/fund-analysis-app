import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AdminPanel from '../AdminPanel.jsx';

function setup() {
  const setFunds = jest.fn();
  render(
    <AdminPanel
      recommendedFunds={[]}
      setRecommendedFunds={setFunds}
      assetClassBenchmarks={{ Equity: { ticker: 'SPY', name: 'S&P 500' } }}
      setAssetClassBenchmarks={() => {}}
      setConfig={() => {}}
    />
  );
  return { setFunds };
}

test('bad ticker shows error then success toast on valid input', async () => {
  setup();
  await userEvent.type(screen.getByLabelText(/Ticker/i), 'bad!');
  await userEvent.type(screen.getByLabelText(/Name/i), 'Test Fund');
  await userEvent.type(screen.getByLabelText(/Asset Class/i), 'Equity');
  await userEvent.click(screen.getByRole('button', { name: /add fund/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid ticker/i);

  await userEvent.clear(screen.getByLabelText(/Ticker/i));
  await userEvent.type(screen.getByLabelText(/Ticker/i), 'GOOD');
  await userEvent.click(screen.getByRole('button', { name: /add fund/i }));
  expect(await screen.findByTestId('toast')).toHaveTextContent(/Fund added/i);
});
