import { render } from '@testing-library/react';
import HeatMapGrid from '@/components/HeatMapGrid.jsx';

const rows = [
  { assetClass: 'Large Cap', benchmarkScore: 60, medianPeerScore: 50, gap: 10 }
];

test('renders heatmap snapshot', () => {
  const { asFragment } = render(<HeatMapGrid rows={rows} onSelect={() => {}} />);
  expect(asFragment()).toMatchSnapshot();
});
