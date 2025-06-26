import 'fake-indexeddb/auto'

// polyfill structuredClone for older jsdom
(global as any).structuredClone =
  (global as any).structuredClone || ((v: any) => JSON.parse(JSON.stringify(v)))

import db, { addSnapshot } from '../services/snapshotStore'
import { getScoreSeries, delta } from '../services/trendAnalysis'

describe('trendAnalysis', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  afterAll(async () => {
    await db.delete()
  })

  test('getScoreSeries returns ordered scores', async () => {
    await addSnapshot({ rows: [{ symbol: 'AAA', score: 1 }], source: 'a', checksum: '1' } as any, '2024-06')
    await addSnapshot({ rows: [{ symbol: 'AAA', score: 2 }], source: 'b', checksum: '2' } as any, '2024-07')
    const series = await getScoreSeries('AAA', 6)
    expect(series).toEqual([
      { id: '2024-06', score: 1 },
      { id: '2024-07', score: 2 }
    ])
  })

  test('delta computes change', () => {
    expect(delta([{ score: 1 }, { score: 3 }])).toBe(2)
    expect(delta([{ score: 1 }])).toBeNull()
  })
})
