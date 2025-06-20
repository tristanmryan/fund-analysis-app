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

  if (typeof fetch === 'function' && !process.env.JEST_WORKER_ID) {
    try {
      const res = await fetch('/data/FundListAssetClasses.csv');
      if (res.ok) {
        const csv = await res.text();
        assetClassMap = parseMap(csv);
        return assetClassMap;
      }
    } catch (e) {
      // fall back to filesystem
    }
  }

  const fs = require('fs');
  const path = require('path');
  const filePath = path.resolve(__dirname, '../../data/FundListAssetClasses.csv');
  const csv = fs.readFileSync(filePath, 'utf-8');
  assetClassMap = parseMap(csv);
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

