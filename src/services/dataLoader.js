import Papa from 'papaparse';
import { assetClassBenchmarks } from '../data/config';

let assetClassMap = null;

function parseMap(csvText) {
  const parsed = Papa.parse(csvText.trim(), { header: true });
  const map = new Map();
  parsed.data.forEach(row => {
    if (!row['Fund Ticker']) return;
    const symbol = row['Fund Ticker'].toString().trim().toUpperCase();
    const cls = (row['Asset Class'] || 'Unknown').trim();
    if (symbol) {
      map.set(symbol, cls);
    }
  });
  return map;
}

async function loadAssetClassMap() {
  if (assetClassMap) return assetClassMap;

  if (process.env.NODE_ENV === 'test') {
    // Jest environment doesn't serve static files so read directly from disk.
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(__dirname, '../../data/FundListAssetClasses.csv');
    const csv = fs.readFileSync(filePath, 'utf-8');
    assetClassMap = parseMap(csv);
    return assetClassMap;
  }

  try {
    const url = `${process.env.PUBLIC_URL || ''}/data/FundListAssetClasses.csv`;
    const res = await fetch(url);
    if (res.ok) {
      const csv = await res.text();
      assetClassMap = parseMap(csv);
    } else {
      assetClassMap = new Map();
    }
  } catch (e) {
    console.error('Failed to load asset class map:', e);
    assetClassMap = new Map();
  }

  return assetClassMap;
}

function lookupAssetClass(symbol) {
  if (!assetClassMap || !symbol) return null;
  const key = symbol.toString().trim().toUpperCase();
  return assetClassMap.get(key) || null;
}

export { loadAssetClassMap, lookupAssetClass };


export function clearAssetClassMap() {
  assetClassMap = null;
}

export function getAssetClassOptions(funds = []) {
  const set = new Set();
  funds.forEach(f => {
    const cls = f['Asset Class'] || f.assetClass;
    if (cls && cls !== 'Benchmark') set.add(cls);
  });
  return Array.from(set).sort();
}

export function ensureBenchmarkRows(list = []) {
  const map = new Map(
    list.map(f => [
      (f.Symbol || f.symbol || '').toString().toUpperCase(),
      f,
    ]),
  );
  Object.entries(assetClassBenchmarks).forEach(([assetClass, { ticker, name }]) => {
    const key = ticker.toString().toUpperCase();
    if (!map.has(key)) {
      console.info('[benchmark-inject]', assetClass, ticker);
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
        expense: null,
      });
    } else {
      const row = map.get(key);
      row.isBenchmark = true;
      if (!row.benchmarkForClass) row.benchmarkForClass = assetClass;
      const existingClass = row.assetClass || row['Asset Class'];
      if (!existingClass || existingClass === 'Benchmark') {
        row.assetClass = assetClass;
        row['Asset Class'] = assetClass;
      } else {
        row.assetClass = existingClass;
        row['Asset Class'] = existingClass;
      }
    }
  });
  return list;
}

