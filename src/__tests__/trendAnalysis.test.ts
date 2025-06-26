import 'fake-indexeddb/auto'
// polyfill structuredClone for jest env
(global as any).structuredClone = (global as any).structuredClone || ((v: any) => JSON.parse(JSON.stringify(v)))
import db, { addSnapshot } from '../services/snapshotStore'
import { getScoreSeries, delta } from '../services/trendAnalysis'
import { NormalisedRow } from '../utils/parseFundFile'

describe('trendAnalysis', () => {
  const baseRow: NormalisedRow = {
    symbol: 'AAA',
    productName: null,
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
    managerTenure: null
  }

  beforeEach(async () => {
    await db.delete()
    await db.open()
    for (let i = 1; i <= 7; i++) {
      const row = { ...baseRow, score: i * 10 }
      await addSnapshot({ rows: [row], source: 'f.csv', checksum: String(i) }, `2024-0${i}`)
    }
  })

  afterAll(async () => {
    await db.delete()
  })

  test('getScoreSeries limits and orders data', async () => {
    const series = await getScoreSeries('AAA', 6)
    expect(series).toHaveLength(6)
    expect(series[0].id).toBe('2024-02')
    expect(series[5].id).toBe('2024-07')
  })

  test('delta computes latest minus previous', async () => {
    const series = await getScoreSeries('AAA', 6)
    const d = delta(series)
    expect(d).toBe(10)
  })

  test('delta returns null for short series', () => {
    expect(delta([{ score: 1 }])).toBeNull()
  })
})
