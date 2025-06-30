import { loadAssetClassMap, lookupAssetClass } from './dataLoader';
import { CURRENT_PERFORMANCE_HEADERS as CUR } from '@/docs/schema';

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
  const yearReg = n => new RegExp(`\\b${n}\\s*year\\b`);

  headers.forEach((h, idx) => {
    if (typeof h !== 'string') return;
    const header = h.toString().trim();
    const headerLower = header.toLowerCase();

    if (headerLower.includes('symbol')) columnMap.Symbol = idx;
    if (headerLower.includes('product name')) columnMap.fundName = idx;
    if (headerLower === 'asset class') columnMap.assetClass = idx;

    if (
      headerLower.includes('total return') &&
      headerLower.includes('ytd') &&
      !headerLower.includes('category')
    )
      columnMap.YTD = idx;
    if (headerLower.includes('ytd return') && !headerLower.includes('category'))
      columnMap['YTD Return'] = idx;

    if (
      headerLower.includes('total return') &&
      yearReg(1).test(headerLower) &&
      !headerLower.includes('category')
    )
      columnMap['1 Year'] = idx;
    if (
      headerLower.includes('1 year return') &&
      !headerLower.includes('category')
    )
      columnMap['1 Year'] = idx;

    if (
      headerLower.includes('total return') &&
      yearReg(3).test(headerLower) &&
      !headerLower.includes('category')
    )
      columnMap['3 Year'] = idx;

    if (
      headerLower.includes('total return') &&
      yearReg(5).test(headerLower) &&
      !headerLower.includes('category')
    )
      columnMap['5 Year'] = idx;

    if (
      headerLower.includes('total return') &&
      yearReg(10).test(headerLower) &&
      !headerLower.includes('category')
    )
      columnMap['10 Year'] = idx;

    if (headerLower.includes('sharpe')) columnMap['Sharpe Ratio'] = idx;
    if (headerLower.includes('standard deviation - 3')) columnMap['StdDev3Y'] = idx;
    if (headerLower.includes('standard deviation - 5')) columnMap['Standard Deviation'] = idx;
    if (headerLower.includes('net exp')) columnMap['Net Expense Ratio'] = idx;
    if (headerLower.includes('manager tenure')) columnMap['Manager Tenure'] = idx;
    if (headerLower.includes('vehicle type') || headerLower === 'type') columnMap.type = idx;

    if (headerLower.includes('alpha') && headerLower.includes('5 year'))
      columnMap[CUR[14]] = idx;
    if (headerLower.includes('up capture') && headerLower.includes('3 year'))
      columnMap[CUR[16]] = idx;
    if (headerLower.includes('down capture') && headerLower.includes('3 year'))
      columnMap[CUR[17]] = idx;
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
        if (
          key === 'Net Expense Ratio' ||
          key === 'Manager Tenure' ||
          key === 'Sharpe Ratio' ||
          key === 'YTD' ||
          key === 'YTD Return' ||
          key.includes('Year') ||
          key.includes('Deviation')
        ) {
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
    let assetClass = f.assetClass;

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

    const ytd = cleanNumber(f.YTD ?? f['YTD Return']);
    const oneYear = cleanNumber(f['1 Year'] ?? f['1 Year Return']);
    const threeYear = cleanNumber(f['3 Year']);
    const fiveYear = cleanNumber(f['5 Year']);
    const tenYear = cleanNumber(f['10 Year']);
    const sharpe3y = cleanNumber(f['Sharpe Ratio']);
    const stdDev3y = cleanNumber(f.StdDev3Y);
    const stdDev5y = cleanNumber(f['Standard Deviation'] ?? f.StdDev5Y);
    const alpha5Y = cleanNumber(f[CUR[14]]);
    const upCapture3Y = cleanNumber(f[CUR[16]]);
    const downCapture3Y = cleanNumber(f[CUR[17]]);
    const expense = cleanNumber(f['Net Expense Ratio']);

    const row = {
      Symbol: f.Symbol,
      symbol: f.Symbol,
      fundName: f['Fund Name'],
      assetClass: assetClassFinal,
      ytd,
      oneYear,
      threeYear,
      fiveYear,
      tenYear,
      sharpe3y,
      stdDev3y,
      stdDev5y,
      alpha5Y,
      upCapture3Y,
      downCapture3Y,
      expenseRatio: expense,
      managerTenure: f['Manager Tenure'],
      type: f.type || ''
    };
    return row;
  });
}
