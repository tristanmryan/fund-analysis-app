import { CURRENT_PERFORMANCE_HEADERS, HISTORICAL_PERFORMANCE_HEADERS, type FundMetrics, type KnownCsvHeader } from '../docs/schema'

export type NormalizedRow = Partial<FundMetrics>

const HEADER_MAP: Record<string, keyof FundMetrics> = {
  [CURRENT_PERFORMANCE_HEADERS[0]]: 'symbolCusip',
  [CURRENT_PERFORMANCE_HEADERS[1]]: 'productName',
  [CURRENT_PERFORMANCE_HEADERS[2]]: 'fundFamilyName',
  [CURRENT_PERFORMANCE_HEADERS[3]]: 'starRating',
  [CURRENT_PERFORMANCE_HEADERS[4]]: 'ytd',
  [CURRENT_PERFORMANCE_HEADERS[5]]: 'ytdRank',
  [CURRENT_PERFORMANCE_HEADERS[6]]: 'oneYear',
  [CURRENT_PERFORMANCE_HEADERS[7]]: 'oneYearRank',
  [CURRENT_PERFORMANCE_HEADERS[8]]: 'threeYear',
  [CURRENT_PERFORMANCE_HEADERS[9]]: 'threeYearRank',
  [CURRENT_PERFORMANCE_HEADERS[10]]: 'fiveYear',
  [CURRENT_PERFORMANCE_HEADERS[11]]: 'fiveYearRank',
  [CURRENT_PERFORMANCE_HEADERS[12]]: 'tenYear',
  [CURRENT_PERFORMANCE_HEADERS[13]]: 'tenYearRank',
  [CURRENT_PERFORMANCE_HEADERS[14]]: 'alpha5Y',
  [CURRENT_PERFORMANCE_HEADERS[15]]: 'stdDev5Y',
  [CURRENT_PERFORMANCE_HEADERS[16]]: 'upCapture3Y',
  [CURRENT_PERFORMANCE_HEADERS[17]]: 'downCapture3Y',
  [CURRENT_PERFORMANCE_HEADERS[18]]: 'secYield',
  [CURRENT_PERFORMANCE_HEADERS[19]]: 'sharpe3Y',
  [CURRENT_PERFORMANCE_HEADERS[20]]: 'stdDev3Y',
  [CURRENT_PERFORMANCE_HEADERS[21]]: 'expenseRatio',
  [CURRENT_PERFORMANCE_HEADERS[22]]: 'managerTenure'
}

export function normalizeHeaders(row: Record<string, unknown>): NormalizedRow {
  const out: Partial<FundMetrics> = {}
  for (const [key, value] of Object.entries(row)) {
    const mapKey = HEADER_MAP[key as string]
    if (mapKey) (out as any)[mapKey] = value as any
  }
  return out
}
