import { render, screen, within } from '@testing-library/react';
import BenchmarkRow from '../BenchmarkRow.jsx';

const funds = [
  { Symbol: 'IWF', 'Fund Name': 'Russell 1000 Growth', scores: { final: 60 } },
  { Symbol: 'AAA', 'Fund Name': 'Fund A', scores: { final: 70 }, '1 Year': 12 },
];

test('benchmark row renders first', () => {
  render(
    <table>
      <tbody>
        <BenchmarkRow data={funds[0]} />
        {funds.slice(1).map(f => (
          <tr key={f.Symbol}>
            <td>{f.Symbol}</td>
            <td>{f['Fund Name']}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const rows = within(screen.getByRole('rowgroup')).getAllByRole('row');
  expect(rows[0].textContent).toContain('Benchmark');
});
