import * as XLSX from 'xlsx';
import parseFundFile from '@/utils/parseFundFile';
import { ensureBenchmarkRows } from './dataLoader';
import { calculateScores } from './scoring';
import { applyTagRules } from './tagEngine';

/**
 * Process an uploaded fund file through parsing, scoring and tagging.
 * Heavy computations are isolated here for use inside a Web Worker.
 * @param {File} file - Uploaded spreadsheet file
 * @param {Object} config - Recommended funds and benchmarks
 * @returns {Promise<Array>} Tagged fund objects
 */
export async function process(file, config = {}) {
  // Read file into rows using XLSX
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const raw = await parseFundFile(rows, config);
  const withBench = ensureBenchmarkRows(raw, config);
  const scored = calculateScores(withBench, config);
  const tagged = applyTagRules(scored, config);

  return tagged;
}
