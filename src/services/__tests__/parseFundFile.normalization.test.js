import parseFundFile from '@/utils/parseFundFile';

const mockRows = [
  ['Symbol', 'Fund Name', 'YTD', '3 Year'],
  ['AAA', 'Sample Fund', '10%', '5.5%'],
];

test('parseFundFile normalizes number fields', async () => {
  const result = await parseFundFile(mockRows);
  expect(result).toHaveLength(1);
  const row = result[0];
  expect(typeof row.threeYear === 'number' || row.threeYear === null).toBe(true);
});
