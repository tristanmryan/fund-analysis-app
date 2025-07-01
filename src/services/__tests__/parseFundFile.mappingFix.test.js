import parseFundFile from '@/utils/parseFundFile';
import { CURRENT_PERFORMANCE_HEADERS as CUR } from '@/docs/schema';

const headers = [
  'Symbol',
  'Fund Name',
  CUR[4],
  CUR[6],
  CUR[8],
  CUR[10],
  CUR[12],
  CUR[14],
  CUR[16],
  CUR[17]
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
  expect(row.ytd).toBeCloseTo(9.2);
  expect(row.oneYear).toBeCloseTo(7.83);
  expect(row.threeYear).toBeCloseTo(5.38911);
  expect(row.fiveYear).toBeCloseTo(5.78925);
  expect(row.tenYear).toBeCloseTo(4.95502);
  expect(row.alpha5Y).toBeCloseTo(0.34);
  expect(row.upCapture3Y).toBeCloseTo(102.5);
  expect(row.downCapture3Y).toBeCloseTo(98.7);
});
