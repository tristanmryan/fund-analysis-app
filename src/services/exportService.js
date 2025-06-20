// src/services/exportService.js

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export an array of fund objects to an Excel (.xlsx) file.
 * @param {Array<Object>} filteredFunds - Scored and tagged fund objects
 * @param {string} [filename] - Optional filename for download
 */
export function exportToExcel(filteredFunds, filename) {
  if (!Array.isArray(filteredFunds) || filteredFunds.length === 0) return;

  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = filename || `Fund_Export_${dateStr}.xlsx`;

  const rows = filteredFunds.map(fund => ({
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

/**
 * Export recommended funds to a PDF summary.
 * @param {Array<Object>} funds - Scored and tagged fund objects
 * @param {string} [filename] - Optional filename for download
 */
export function exportToPDF(funds, filename) {
  if (!Array.isArray(funds) || funds.length === 0) return;

  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = filename || `Fund_Summary_${dateStr}.pdf`;

  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.text('Fund Performance Summary', 14, 20);
  doc.setFontSize(10);
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  doc.text(new Date().toLocaleDateString(undefined, dateOptions), 14, 28);

  // Recommended funds only
  const rows = funds
    .filter(f => f.isRecommended)
    .map(f => [
      f.cleanSymbol || f.Symbol || f.symbol || '',
      f['Fund Name'] || f.name || '',
      f['Asset Class'] || f.assetClass || '',
      f.scores?.final != null ? String(f.scores.final) : '',
      Array.isArray(f.tags) ? f.tags.join(', ') : '',
      f.isBenchmark ? 'Yes' : ''
    ]);

  doc.autoTable({
    head: [['Symbol', 'Fund Name', 'Asset Class', 'Score', 'Tags', 'Benchmark?']],
    body: rows,
    startY: 34,
    styles: { fontSize: 8 },
    theme: 'grid',
    headStyles: { fillColor: [230, 230, 230] }
  });

  doc.save(safeName);
}
