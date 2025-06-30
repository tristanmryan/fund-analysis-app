// src/utils/parseFundFile.ts
import * as XLSX from 'xlsx'
import { sha1Hex } from './hash'
import { recommendedFunds, assetClassBenchmarks } from '../data/config.js'
import { loadAssetClassMap, lookupAssetClass } from '../services/dataLoader.js'
import {
  CURRENT_PERFORMANCE_HEADERS as CUR,
  HISTORICAL_PERFORMANCE_HEADERS as HIST,
} from '../docs/schema';

export const COLUMN_MAP: Record<string, keyof NormalisedRow> = {
  'Symbol': 'symbol',
  [CUR[0]]: 'symbol',
  [CUR[1]]: 'fundName',
  [CUR[4]]: 'ytdReturn',
  [CUR[6]]: 'oneYearReturn',
  'Total Return - 3 Year (%)': 'threeYearReturn',
  'Total Return - 5 Year (%)': 'fiveYearReturn',
  'Total Return - 10 Year (%)': 'tenYearReturn',
  [CUR[8]]: 'threeYearReturn',
  [CUR[10]]: 'fiveYearReturn',
  [CUR[12]]: 'tenYearReturn',
  'YTD Return (%)': 'ytdReturn',
  'Return 1 Year (%)': 'oneYearReturn',
  'Return 3 Year (%)': 'threeYearReturn',
  'Return 5 Year (%)': 'fiveYearReturn',
  'Return 10 Year (%)': 'tenYearReturn',
  'Sharpe Ratio (3 Year)': 'sharpe3y',
  [CUR[19]]: 'sharpe3y',
  'Sharpe Ratio 3Y': 'sharpe3y',
  'Standard Deviation (3 Year) (%)': 'stdDev3y',
  [CUR[20]]: 'stdDev3y',
  'Std Dev 3Y (%)': 'stdDev3y',
  'Standard Deviation (5 Year) (%)': 'stdDev5y',
  [CUR[15]]: 'stdDev5y',
  'Std Dev 5Y (%)': 'stdDev5y',
  [CUR[14]]: 'alpha5y',
  [CUR[14]]: 'alpha5y',
  'Alpha 5Y (%)': 'alpha5y',
  'Net Expense Ratio (%)': 'netExpenseRatio',
  [CUR[21]]: 'netExpenseRatio',
  'Expense Ratio Net (%)': 'netExpenseRatio',
  'Manager Tenure (Years)': 'managerTenure',
  [CUR[22]]: 'managerTenure',
  'Manager Tenure (Yrs)': 'managerTenure',
  'Up Capture Ratio 3Y (%)': 'upCapture3y',
  [CUR[16]]: 'upCapture3y',
  'Down Capture Ratio 3Y (%)': 'downCapture3y',
  [CUR[17]]: 'downCapture3y',
  [CUR[5]]: 'rankYtd',
  'Category Rank (%) Total Return  YTD': 'rankYtd'
}

export interface NormalisedRow {
  symbol: string
  fundName: string | null
  ytdReturn: number | null
  oneYearReturn: number | null
  threeYearReturn: number | null
  fiveYearReturn: number | null
  tenYearReturn: number | null
  sharpe3y: number | null
  stdDev3y: number | null
  stdDev5y: number | null
  alpha5y: number | null
  netExpenseRatio: number | null
  managerTenure: number | null
  upCapture3y?: number | null
  downCapture3y?: number | null
  rankYtd?: number | null
  tags?: string[]
  assetClass?: string
  isBenchmark?: boolean
  benchmarkForClass?: string
}

export interface ParsedSnapshot {
  id?: string
  rows: NormalisedRow[]
  source: string
  checksum: string
}

const REQUIRED = [
  'symbol',
  'ytdReturn',
  'oneYearReturn',
  'threeYearReturn',
  'fiveYearReturn',
  'tenYearReturn',
  'sharpe3y',
  'netExpenseRatio',
  'managerTenure',
  'alpha5y'
] as const

function parseNumber(val: any): number | null {
  if (val == null || val === '') return null
  if (typeof val === 'string') val = val.replace(/[%,]/g, '').trim()
  const n = parseFloat(val)
  return Number.isNaN(n) ? null : n
}

async function readFileAsRows(file: File): Promise<any[][]> {
  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await file.text()
    const wb = XLSX.read(text, { type: 'string' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
  }
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
}


export async function parseFundFile(
  file: File,
  columnMap = COLUMN_MAP
): Promise<ParsedSnapshot> {
  const rows = await readFileAsRows(file)
  await loadAssetClassMap()
  const headerIndex = rows.findIndex(r =>
    r.some(c => typeof c === 'string' && c.toLowerCase().includes('symbol'))
  )
  if (headerIndex === -1) throw new Error('Header row not found')
  const headers = rows[headerIndex].map(h => (h ? h.toString().trim() : ''))
  const map: Record<number, keyof NormalisedRow> = {}
  headers.forEach((h, i) => {
    const key = columnMap[h]
    if (key) map[i] = key
  })
  const columnsPresent = new Set(Object.values(map))
  REQUIRED.forEach(req => {
    if (!columnsPresent.has(req as keyof NormalisedRow)) {
      throw new Error(`Missing required column: ${req}`)
    }
  })
  if (!columnsPresent.has('stdDev3y') && !columnsPresent.has('stdDev5y')) {
    throw new Error('Missing required column: stdDev3y or stdDev5y')
  }
  const dataRows = rows.slice(headerIndex + 1)
  const list: NormalisedRow[] = []
  for (const row of dataRows) {
    if (!row || row.every(v => v == null || String(v).trim() === '')) continue
    const obj: any = {
      symbol: '',
      fundName: null,
      ytdReturn: null,
      oneYearReturn: null,
      threeYearReturn: null,
      fiveYearReturn: null,
      tenYearReturn: null,
      sharpe3y: null,
      stdDev3y: null,
      stdDev5y: null,
      alpha5y: null,
      netExpenseRatio: null,
      managerTenure: null,
      upCapture3y: null,
      downCapture3y: null,
      rankYtd: null
    }
    for (const [idxStr, key] of Object.entries(map)) {
      const idx = Number(idxStr)
      const val = row[idx]
      if (key === 'symbol') {
        obj.symbol = (val ?? '').toString().trim().toUpperCase()
      } else if (key === 'fundName') {
        obj.fundName = val ? String(val).trim() : null
      } else if (
        key === 'upCapture3y' ||
        key === 'downCapture3y' ||
        key === 'rankYtd' ||
        key === 'ytdReturn' ||
        key === 'oneYearReturn' ||
        key === 'threeYearReturn' ||
        key === 'fiveYearReturn' ||
        key === 'tenYearReturn' ||
        key === 'sharpe3y' ||
        key === 'stdDev3y' ||
        key === 'stdDev5y' ||
        key === 'alpha5y' ||
        key === 'netExpenseRatio' ||
        key === 'managerTenure'
      ) {
        obj[key] = parseNumber(val)
      } else {
        obj[key] = val
      }
    }
    const rec = recommendedFunds.find(r => r.symbol.toUpperCase() === obj.symbol)
    if (rec) obj.fundName = rec.name
    if (obj.fundName === undefined) obj.fundName = null

    let assetClass: string | null | undefined = rec?.assetClass
    let benchmarkForClass: string | undefined
    if (!assetClass) {
      for (const [ac, b] of Object.entries(assetClassBenchmarks)) {
        if (b.ticker.toUpperCase() === obj.symbol) {
          assetClass = ac
          benchmarkForClass = ac
          break
        }
      }
    }
    if (!assetClass) {
      const lookedUp = lookupAssetClass(obj.symbol)
      assetClass = lookedUp == null ? 'Unknown' : lookedUp
    }

    obj.assetClass = assetClass || 'Unknown'
    if (benchmarkForClass) {
      obj.isBenchmark = true
      obj.benchmarkForClass = benchmarkForClass
    }

    list.push(obj as NormalisedRow)
  }
  return {
    id: undefined,
    rows: list,
    source: file.name,
    checksum: await sha1Hex(file)
  }
}

export default parseFundFile
