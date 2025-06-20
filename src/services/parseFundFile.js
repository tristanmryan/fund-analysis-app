import { loadAssetClassMap, lookupAssetClass } from './dataLoader';

/**
 * Parse uploaded fund CSV/XLSX rows into normalized fund objects.
 * @param {Array<Array>} rows - raw rows from XLSX.utils.sheet_to_json(...,{header:1})
 * @param {Object} options - recommended funds and benchmark config
 * @returns {Promise<Array<Object>>} parsed fund objects
 */
export default async function parseFundFile(rows, options = {}) {
  const { recommendedFunds = [], assetClassBenchmarks = {} } = options;
  await loadAssetClassMap();

  // locate header row
  const headerRowIndex = rows.findIndex(r => r.some(c => typeof c === 'string' && c.toString().includes('Symbol')));
  if (headerRowIndex === -1) throw new Error('Header row not found');
  const headers = rows[headerRowIndex];
  const dataRows = rows.slice(headerRowIndex + 1);

  const columnMap = {};
  headers.forEach((h, idx) => {
    if (typeof h !== 'string') return;
    const header = h.trim();
    if (header.includes('Symbol')) columnMap.Symbol = idx;
    if (header.includes('Product Name')) columnMap['Fund Name'] = idx;
    if (header.includes('Asset Class')) columnMap['Asset Class'] = idx;
    if (header.includes('1 Year')) columnMap['1 Year'] = idx;
    if (header.includes('Sharpe')) columnMap['Sharpe Ratio'] = idx;
    if (header.includes('Standard Deviation - 5')) columnMap['Std Dev (5Y)'] = idx;
    if (header.includes('Standard Deviation - 3')) columnMap['Std Dev (3Y)'] = idx;
    if (header.includes('Net Exp')) columnMap.Expense = idx;
    if (header.includes('Vehicle Type') || header.trim() === 'Type') columnMap.Type = idx;
  });

  const cleanNumber = val => {
    if (val == null || val === '') return null;
    if (typeof val === 'string') val = val.replace(/[%,]/g, '').trim();
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  };

  const cleanText = v => (v == null ? '' : v.toString().trim());
  const clean = s => s?.toUpperCase().trim();

  const parsed = dataRows
    .map(row => {
      const obj = {};
      Object.entries(columnMap).forEach(([key, idx]) => {
        const val = row[idx];
        obj[key] = key === 'Expense' || key.startsWith('Std Dev') || key === 'Sharpe Ratio' || key === '1 Year'
          ? cleanNumber(val)
          : cleanText(val);
      });
      return obj;
    })
    .filter(f => f.Symbol);

  return parsed.map(f => {
    const symbolClean = clean(f.Symbol);
    let assetClass = f['Asset Class'];

    if (!assetClass) {
      const rec = recommendedFunds.find(r => clean(r.symbol) === symbolClean);
      if (rec) assetClass = rec.assetClass;
    }
    if (!assetClass) {
      for (const [ac, b] of Object.entries(assetClassBenchmarks)) {
        if (clean(b.ticker) === symbolClean) {
          assetClass = ac;
          break;
        }
      }
    }
    if (!assetClass) assetClass = lookupAssetClass(symbolClean);

    return {
      Symbol: f.Symbol,
      'Fund Name': f['Fund Name'],
      'Asset Class': assetClass,
      assetClass,
      '1 Year': f['1 Year'],
      'Sharpe Ratio': f['Sharpe Ratio'],
      'Std Dev (5Y)': f['Std Dev (5Y)'],
      Expense: f.Expense,
      Type: f.Type || '',
    };
  });
}
