import { render, screen, within } from '@testing-library/react';
import BenchmarkRow from '../BenchmarkRow.jsx';

const funds = [
  { Symbol: 'IWF', fundName: 'Russell 1000 Growth', scores: { final: 60 }, ytd: 3 },
  { Symbol: 'AAA', fundName: 'Fund A', scores: { final: 70 }, oneYear: 12 },
];

test('benchmark row renders first', () => {
  render(
    <table>
      <tbody>
        <BenchmarkRow fund={funds[0]} />
        {funds.slice(1).map(f => (
          <tr key={f.Symbol}>
            <td>{f.Symbol}</td>
            <td>{f.fundName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const rows = screen.getAllByRole('row');
  expect(rows[0].textContent).toContain('Benchmark');
});
