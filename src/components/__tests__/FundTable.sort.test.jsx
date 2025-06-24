import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FundTable from '../FundTable.jsx';

test('clicking numeric header sorts desc then asc', async () => {
  const data = [
    { Symbol: 'A', 'Fund Name': 'A', scores: { final: 50 } },
    { Symbol: 'B', 'Fund Name': 'B', scores: { final: 70 } }
  ];
  render(<FundTable rows={data} />);
  const scoreHeader = screen.getByRole('columnheader', { name: /Score/i });
  await userEvent.click(scoreHeader);
  const table = screen.getByRole('table');
  let first = table.querySelector('tbody tr:first-child td');
  expect(first.textContent).toContain('B');
  await userEvent.click(scoreHeader);
  first = table.querySelector('tbody tr:first-child td');
  expect(first.textContent).toContain('A');
});
