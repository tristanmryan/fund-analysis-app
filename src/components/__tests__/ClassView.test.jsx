import { render, screen, within } from '@testing-library/react';
import BenchmarkRow from '../BenchmarkRow.jsx';

const funds = [
  { Symbol: 'IWF', 'Fund Name': 'Russell 1000 Growth', scores: { final: 60 }, YTD: 3 },
  { Symbol: 'AAA', 'Fund Name': 'Fund A', scores: { final: 70 }, '1 Year': 12 },
];

test('benchmark row renders first', () => {
  render(
    <div>
      <BenchmarkRow data={funds[0]} />
      <table>
        <tbody>
          {funds.slice(1).map(f => (
            <tr key={f.Symbol}>
              <td>{f.Symbol}</td>
              <td>{f['Fund Name']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const rows = screen.getAllByRole('row');
  expect(rows[0].textContent).toContain('Benchmark');
});
