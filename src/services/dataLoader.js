import Papa from 'papaparse';

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

export async function loadAssetClassMap() {
  if (assetClassMap) return assetClassMap;

  if (process.env.NODE_ENV === 'test') {
    // Jest environment doesn't serve static files so read directly from disk
    // The conditional ensures these Node-specific requires are stripped from the
    // production bundle.
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(__dirname, '../../data/FundListAssetClasses.csv');
    const csv = fs.readFileSync(filePath, 'utf-8');
    assetClassMap = parseMap(csv);
    return assetClassMap;
  }

  try {
    const res = await fetch('/data/FundListAssetClasses.csv');
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

export function lookupAssetClass(symbol) {
  if (!assetClassMap || !symbol) return 'Unknown';
  const key = symbol.toString().trim().toUpperCase();
  return assetClassMap.get(key) || 'Unknown';
}

export function clearAssetClassMap() {
  assetClassMap = null;
}

