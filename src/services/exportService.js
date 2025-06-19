// src/services/exportService.js

import * as XLSX from 'xlsx';

/**
 * Export an array of fund objects to an Excel (.xlsx) file.
 * @param {Array<Object>} funds - Scored and tagged fund objects
 * @param {string} [filename] - Optional filename for download
 */
export function exportToExcel(funds, filename) {
  if (!Array.isArray(funds) || funds.length === 0) return;

  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = filename || `Fund_Export_${dateStr}.xlsx`;

  const rows = funds.map(fund => ({
    Symbol: fund.cleanSymbol || fund.Symbol || fund.symbol || '',
    'Fund Name': fund['Fund Name'] || fund.name || '',
    'Asset Class': fund['Asset Class'] || fund.assetClass || '',
    Score: fund.scores?.final ?? '',
    Tags: Array.isArray(fund.tags) ? fund.tags.join(', ') : '',
    'Expense Ratio': fund.metrics?.expenseRatio ?? '',
    'Sharpe Ratio': fund.metrics?.sharpeRatio3Y ?? '',
    'Std Dev':
      fund.metrics?.stdDev5Y ?? fund.metrics?.stdDev3Y ?? '',
    Alpha: fund.metrics?.alpha5Y ?? '',
    'Up Capture': fund.metrics?.upCapture3Y ?? '',
    'Down Capture': fund.metrics?.downCapture3Y ?? '',
    'Manager Tenure':
      fund.metrics?.managerTenure ?? fund.managerTenure ?? ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Funds');

  XLSX.writeFile(workbook, safeName);
}
