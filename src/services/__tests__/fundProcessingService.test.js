import { process } from '@/services/fundProcessingService';
import parseFundFile from '@/utils/parseFundFile';
import { ensureBenchmarkRows } from '@/services/dataLoader';
import { calculateScores } from '@/services/scoring';
import { applyTagRules } from '@/services/tagEngine';
import * as XLSX from 'xlsx';

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('@/utils/parseFundFile');
jest.mock('@/services/dataLoader', () => ({ ensureBenchmarkRows: jest.fn() }));
jest.mock('@/services/scoring', () => ({ calculateScores: jest.fn() }));
jest.mock('@/services/tagEngine', () => ({ applyTagRules: jest.fn() }));
jest.mock('xlsx');

test('process executes helpers in order', async () => {
  const rows = [['a']];
  XLSX.read.mockReturnValue({ SheetNames: ['s'], Sheets: { s: {} } });
  XLSX.utils.sheet_to_json.mockReturnValue(rows);
  parseFundFile.mockResolvedValue('parsed');
  ensureBenchmarkRows.mockReturnValue('bench');
  calculateScores.mockReturnValue('scored');
  applyTagRules.mockReturnValue('tagged');

  const file = {
    name: 'test.xlsx',
    arrayBuffer: async () => new ArrayBuffer(8)
  };
  const result = await process(file, { foo: 'bar' });

  expect(XLSX.read).toHaveBeenCalled();
  expect(parseFundFile).toHaveBeenCalledWith(rows, { foo: 'bar' });
  expect(ensureBenchmarkRows).toHaveBeenCalledWith('parsed', { foo: 'bar' });
  expect(calculateScores).toHaveBeenCalledWith('bench', { foo: 'bar' });
  expect(applyTagRules).toHaveBeenCalledWith('scored', { foo: 'bar' });
  expect(result).toBe('tagged');
});
