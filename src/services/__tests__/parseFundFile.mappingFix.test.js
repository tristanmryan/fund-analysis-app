import parseFundFile from '../parseFundFile';

const headers = [
  'Symbol',
  'Fund Name',
  'Total Return - YTD (%)',
  'Total Return - 1 Year (%)',
  'Annualized Total Return - 3 Year (%)',
  'Annualized Total Return - 5 Year (%)',
  'Annualized Total Return - 10 Year (%)',
  'Alpha (Asset Class) - 5 Year',
  'Up Capture Ratio (Morningstar Standard) - 3 Year',
  'Down Capture Ratio (Morningstar Standard) - 3 Year'
];

const dataRow = [
  'AAA',
  'Sample Fund',
  '9.2',
  '7.83',
  '5.38911',
  '5.78925',
  '4.95502',
  '0.34',
  '102.5',
  '98.7'
];

test('correctly maps annualized returns and capture ratios', async () => {
  const result = await parseFundFile([headers, dataRow]);
  const row = result[0];
  expect(row.YTD).toBeCloseTo(9.2);
  expect(row['1 Year']).toBeCloseTo(7.83);
  expect(row['3 Year']).toBeCloseTo(5.38911);
  expect(row['5 Year']).toBeCloseTo(5.78925);
  expect(row['10 Year']).toBeCloseTo(4.95502);
  expect(row.alpha5Y).toBeCloseTo(0.34);
  expect(row.upCapture3Y).toBeCloseTo(102.5);
  expect(row.downCapture3Y).toBeCloseTo(98.7);
});
