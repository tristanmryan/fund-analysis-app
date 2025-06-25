import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AnalysisView from '../components/Views/AnalysisView.jsx';

const sampleFunds = [
  { assetClass: 'Large Cap', Symbol: 'IWF', isBenchmark: true, scores: { final: 60 } },
  { assetClass: 'Large Cap', Symbol: 'A', isBenchmark: false, scores: { final: 50 } },
  { assetClass: 'Large Cap', Symbol: 'B', isBenchmark: false, scores: { final: 48 } },
  { assetClass: 'Large Cap', Symbol: 'C', isBenchmark: false, scores: { final: 52 } },
  { assetClass: 'Large Cap', Symbol: 'D', isBenchmark: false, scores: { final: 55 } },
  { assetClass: 'Bond', Symbol: 'AGG', isBenchmark: true, scores: { final: 70 } },
  { assetClass: 'Bond', Symbol: 'E', isBenchmark: false, scores: { final: 65 } },
  { assetClass: 'Bond', Symbol: 'F', isBenchmark: false, scores: { final: 66 } },
  { assetClass: 'Bond', Symbol: 'G', isBenchmark: false, scores: { final: 64 } },
  { assetClass: 'Bond', Symbol: 'H', isBenchmark: false, scores: { final: 50 } }
];

const reviewCandidates = [
  { 'Fund Name': 'Test Fund', Symbol: 'A', assetClass: 'Large Cap', scores: { final: 45 }, reviewReasons: ['Low score'] }
];

test('gap filter and row click work', async () => {
  const handler = jest.fn();
  render(<AnalysisView funds={sampleFunds} reviewCandidates={reviewCandidates} onSelectClass={handler} />);

  expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 rows

  const input = screen.getByLabelText(/Bench.*Median/);
  await userEvent.clear(input);
  await userEvent.type(input, '7');

  expect(screen.getAllByRole('row')).toHaveLength(2); // header + 1 row

  const toggle = screen.getByLabelText('toggle view');
  await userEvent.click(toggle);
  expect(screen.getByRole('table')).toBeInTheDocument();

  await userEvent.click(screen.getByText('Large Cap'));
  expect(handler).toHaveBeenCalledWith('Large Cap');
});

