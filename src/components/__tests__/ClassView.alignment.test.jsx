import { render } from '@testing-library/react';
import ClassView from '../ClassView.jsx';

const funds = [
  { Symbol: 'IWF', 'Fund Name': 'Index', isBenchmark: true, scores: { final: 60 } },
  { Symbol: 'AAA', 'Fund Name': 'Fund A', scores: { final: 70 } }
];

test('benchmark row aligns with table', () => {
  const { asFragment } = render(<ClassView funds={funds} />);
  expect(asFragment()).toMatchSnapshot();
});
