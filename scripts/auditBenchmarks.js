import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { recommendedFunds, assetClassBenchmarks } from '../src/data/config.js';
import { calculateScores } from '../src/services/scoring.js';

function loadAssetClassMapSync() {
  const csv = fs.readFileSync(path.resolve('data/FundListAssetClasses.csv'), 'utf8');
  const parsed = Papa.parse(csv.trim(), { header: true });
  const map = new Map();
  parsed.data.forEach(row => {
    if (!row['Fund Ticker']) return;
    const sym = row['Fund Ticker'].toString().trim().toUpperCase();
    const cls = (row['Asset Class'] || 'Unknown').trim();
    map.set(sym, cls);
  });
  return map;
}
const assetClassMap = loadAssetClassMapSync();
const lookupAssetClass = symbol => assetClassMap.get(symbol.toUpperCase()) || null;

function ensureBenchmarkRows(list = []) {
  const map = new Map(list.map(f => [(f.Symbol || f.symbol || '').toString().toUpperCase(), f]));
  Object.entries(assetClassBenchmarks).forEach(([assetClass, { ticker, name }]) => {
    const key = ticker.toString().toUpperCase();
    if (!map.has(key)) {
      list.push({
        Symbol: ticker,
        symbol: ticker,
        'Fund Name': name,
        name,
        assetClass,
        'Asset Class': assetClass,
        isBenchmark: true,
        benchmarkForClass: assetClass,
        ytd: null,
        oneYear: null,
        threeYear: null,
        fiveYear: null,
        sharpe: null,
        stdDev5y: null,
        expense: null
      });
    } else {
      const row = map.get(key);
      row.isBenchmark = true;
      if (!row.benchmarkForClass) row.benchmarkForClass = assetClass;
      if (!row.assetClass) row.assetClass = row['Asset Class'] || assetClass;
      row['Asset Class'] = row.assetClass;
    }
  });
  return list;
}

const clean = s => (s ? s.toUpperCase().trim().replace(/[^A-Z0-9]/g, '') : '');

async function main() {
  const csvPath = path.resolve('data/Fund_Performance_Data.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const wb = XLSX.read(csv, { type: 'string' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });

  const stageLogs = [];

  const headerRowIndex = rows.findIndex(r => r.some(c => typeof c === 'string' && c.toString().includes('Symbol')));
  const headers = rows[headerRowIndex];
  const dataRows = rows.slice(headerRowIndex + 1);

  const parsed = dataRows
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    })
    .filter(r => r.Symbol || r['Symbol/CUSIP']);

  stageLogs.push({ stage: 'parseFundFile', module: 'parseFundFile', before: rows.length - 1, after: parsed.length, benchmarks: 0 });

  let flagged = parsed.map(f => {
    const sym = clean(f.Symbol || f['Symbol/CUSIP']);
    const rec = recommendedFunds.find(r => clean(r.symbol) === sym);
    let isBenchmark = false;
    let benchmarkForClass = null;
    for (const [ac, b] of Object.entries(assetClassBenchmarks)) {
      if (clean(b.ticker) === sym) {
        isBenchmark = true;
        benchmarkForClass = ac;
      }
    }
    const resolved = rec ? rec.assetClass : benchmarkForClass || lookupAssetClass(sym);
    return {
      ...f,
      cleanSymbol: sym,
      isRecommended: !!rec,
      isBenchmark,
      benchmarkForClass,
      assetClass: resolved || f['Asset Class'],
      'Asset Class': resolved || f['Asset Class']
    };
  });
  stageLogs.push({ stage: 'flagRows', module: 'App.jsx mapping', before: parsed.length, after: flagged.length, benchmarks: flagged.filter(r => r.isBenchmark).length });

  const beforeEnsure = flagged.length;
  const ensured = ensureBenchmarkRows(flagged);
  stageLogs.push({ stage: 'ensureBenchmarkRows', module: 'dataLoader.ensureBenchmarkRows', before: beforeEnsure, after: ensured.length, benchmarks: ensured.filter(r => r.isBenchmark).length });

  const scored = calculateScores(ensured);
  stageLogs.push({ stage: 'calculateScores', module: 'scoring.calculateScores', before: ensured.length, after: scored.length, benchmarks: scored.filter(r => r.isBenchmark).length });

  console.table(stageLogs);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
