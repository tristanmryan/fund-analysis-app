import parseFundFile from '../parseFundFile';

const headers = [
  'Symbol',
  'Fund Name',
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
  '5.38911',
  '5.78925',
  '7.12345',
  '0.34',
  '102.5',
  '98.7'
];

test('correctly maps annualized returns and capture ratios', async () => {
  const result = await parseFundFile([headers, dataRow]);
  const row = result[0];
  expect(row['3 Year']).toBeCloseTo(5.38911);
  expect(row['5 Year']).toBeCloseTo(5.78925);
  expect(row['10 Year']).toBeCloseTo(7.12345);
  expect(row.alpha5Y).toBeCloseTo(0.34);
  expect(row.upCapture3Y).toBeCloseTo(102.5);
  expect(row.downCapture3Y).toBeCloseTo(98.7);
});
