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
    const header = h.toString().trim();
    const headerLower = header.toLowerCase();
    if (headerLower.includes('symbol')) columnMap.Symbol = idx;
    if (headerLower.includes('product name')) columnMap['Fund Name'] = idx;
    if (headerLower === 'asset class') columnMap['Asset Class'] = idx;
    if (headerLower.includes('1 year')) columnMap['1 Year'] = idx;
    if (headerLower.includes('sharpe')) columnMap['Sharpe Ratio'] = idx;
    if (headerLower.includes('standard deviation - 5')) columnMap['Std Dev (5Y)'] = idx;
    if (headerLower.includes('standard deviation - 3')) columnMap['Std Dev (3Y)'] = idx;
    if (headerLower.includes('net exp')) columnMap.expense = idx;
    if (headerLower.includes('vehicle type') || headerLower === 'type') columnMap.type = idx;
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
        if (key === 'expense' || key.startsWith('Std Dev') || key === 'Sharpe Ratio' || key === '1 Year') {
          obj[key] = cleanNumber(val);
        } else {
          obj[key] = cleanText(val);
        }
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
    if (!assetClass) {
      const lookedUp = lookupAssetClass(symbolClean);
      assetClass = lookedUp == null ? 'Unknown' : lookedUp;
    }

    const assetClassFinal = assetClass || 'Unknown';

    return {
      Symbol: f.Symbol,
      'Fund Name': f['Fund Name'],
      'Asset Class': assetClassFinal,
      assetClass: assetClassFinal,
      '1 Year': f['1 Year'],
      'Sharpe Ratio': f['Sharpe Ratio'],
      'Std Dev (5Y)': f['Std Dev (5Y)'],
      Expense: f.expense,
      Type: f.type || '',
    };
  });
}
