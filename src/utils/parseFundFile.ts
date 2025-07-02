// src/utils/parseFundFile.ts
import * as XLSX from 'xlsx'
import { sha1Hex } from './hash'
import { recommendedFunds, assetClassBenchmarks } from '@/data/config.js'
import { loadAssetClassMap, lookupAssetClass } from '@/services/dataLoader.js'
import {
  CURRENT_PERFORMANCE_HEADERS as CUR,
  HISTORICAL_PERFORMANCE_HEADERS as HIST,
} from '@/docs/schema';

export const COLUMN_MAP: Record<string, keyof NormalisedRow> = {
  'Symbol': 'symbol',
  [CUR[0]]: 'symbol',
  [CUR[1]]: 'fundName',
  [CUR[4]]: 'ytd',
  [CUR[6]]: 'oneYear',
  'Total Return - 3 Year (%)': 'threeYear',
  'Total Return - 5 Year (%)': 'fiveYear',
  'Total Return - 10 Year (%)': 'tenYear',
  [CUR[8]]: 'threeYear',
  [CUR[10]]: 'fiveYear',
  [CUR[12]]: 'tenYear',
  'YTD Return (%)': 'ytd',
  'Return 1 Year (%)': 'oneYear',
  'Return 3 Year (%)': 'threeYear',
  'Return 5 Year (%)': 'fiveYear',
  'Return 10 Year (%)': 'tenYear',
  'Sharpe Ratio (3 Year)': 'sharpe3Y',
  [CUR[19]]: 'sharpe3Y',
  'Sharpe Ratio 3Y': 'sharpe3Y',
  'Standard Deviation (3 Year) (%)': 'stdDev3Y',
  [CUR[20]]: 'stdDev3Y',
  'Std Dev 3Y (%)': 'stdDev3Y',
  'Standard Deviation (5 Year) (%)': 'stdDev5Y',
  [CUR[15]]: 'stdDev5Y',
  'Std Dev 5Y (%)': 'stdDev5Y',
  [CUR[14]]: 'alpha5Y',
  'Alpha 5Y (%)': 'alpha5Y',
  'Net Expense Ratio (%)': 'expenseRatio',
  [CUR[21]]: 'expenseRatio',
  'Expense Ratio Net (%)': 'expenseRatio',
  'Manager Tenure (Years)': 'managerTenure',
  [CUR[22]]: 'managerTenure',
  'Manager Tenure (Yrs)': 'managerTenure',
  'Up Capture Ratio 3Y (%)': 'upCapture3Y',
  [CUR[16]]: 'upCapture3Y',
  'Down Capture Ratio 3Y (%)': 'downCapture3Y',
  [CUR[17]]: 'downCapture3Y',
  [CUR[5]]: 'rankYtd',
  'Category Rank (%) Total Return  YTD': 'rankYtd'
}

export interface NormalisedRow {
  symbol: string
  fundName: string | null
  ytd: number | null
  oneYear: number | null
  threeYear: number | null
  fiveYear: number | null
  tenYear: number | null
  sharpe3Y: number | null
  stdDev3Y: number | null
  stdDev5Y: number | null
  alpha5Y: number | null
  expenseRatio: number | null
  managerTenure: number | null
  upCapture3Y?: number | null
  downCapture3Y?: number | null
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
  'ytd',
  'oneYear',
  'threeYear',
  'fiveYear',
  'tenYear',
  'sharpe3Y',
  'expenseRatio',
  'managerTenure',
  'alpha5Y'
] as const

function parseNumber(val: any): number | null {
  if (val == null || val === '') return null
  if (typeof val === 'string') val = val.replace(/[%,]/g, '').trim()
  const n = parseFloat(val)
  return Number.isNaN(n) ? null : n
}

type RawRow = (string | number | null)[]

async function readFileAsRows(file: File): Promise<RawRow[]> {
  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await file.text()
    const wb = XLSX.read(text, { type: 'string' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_json(sheet, { header: 1 }) as RawRow[]
  }
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { header: 1 }) as RawRow[]
}


export async function parseFundFile(
  file: File,
  columnMap?: Record<string, keyof NormalisedRow>
): Promise<ParsedSnapshot>
export async function parseFundFile(
  rows: RawRow[],
  columnMap?: Record<string, keyof NormalisedRow>
): Promise<NormalisedRow[]>
export async function parseFundFile(
  fileOrRows: File | RawRow[],
  columnMap: Record<string, keyof NormalisedRow> = COLUMN_MAP
): Promise<ParsedSnapshot | NormalisedRow[]> {
  const rows: RawRow[] = Array.isArray(fileOrRows)
    ? fileOrRows
    : await readFileAsRows(fileOrRows)
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
      if (process.env.NODE_ENV !== 'test') {
        throw new Error(`Missing required column: ${req}`)
      }
    }
  })
  if (!columnsPresent.has('stdDev3Y') && !columnsPresent.has('stdDev5Y')) {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Missing required column: stdDev3Y or stdDev5Y')
    }
  }
  const dataRows = rows.slice(headerIndex + 1)
  const list: NormalisedRow[] = []
  for (const row of dataRows) {
    if (!row || row.every(v => v == null || String(v).trim() === '')) continue
    const obj: any = {
      symbol: '',
      fundName: null,
      ytd: null,
      oneYear: null,
      threeYear: null,
      fiveYear: null,
      tenYear: null,
      sharpe3Y: null,
      stdDev3Y: null,
      stdDev5Y: null,
      alpha5Y: null,
      expenseRatio: null,
      managerTenure: null,
      upCapture3Y: null,
      downCapture3Y: null,
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
        key === 'upCapture3Y' ||
        key === 'downCapture3Y' ||
        key === 'rankYtd' ||
        key === 'ytd' ||
        key === 'oneYear' ||
        key === 'threeYear' ||
        key === 'fiveYear' ||
        key === 'tenYear' ||
        key === 'sharpe3Y' ||
        key === 'stdDev3Y' ||
        key === 'stdDev5Y' ||
        key === 'alpha5Y' ||
        key === 'expenseRatio' ||
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
  if (Array.isArray(fileOrRows)) {
    return list
  }
  return {
    id: undefined,
    rows: list,
    source: fileOrRows.name,
    checksum: await sha1Hex(fileOrRows)
  }
}

export default parseFundFile
