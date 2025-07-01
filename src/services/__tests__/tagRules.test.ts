import { applyTagRules } from '../tagRules'
import { ParsedSnapshot } from '@/utils/parseFundFile'

describe('applyTagRules', () => {
  function makeSnap(id: string, score: number): ParsedSnapshot {
    return {
      id,
      rows: [{ symbol: 'AAA', score } as any],
      source: 'x',
      checksum: id
    }
  }

  test('improving tag', () => {
    const s1 = makeSnap('1', 50)
    const s2 = makeSnap('2', 55)
    const s3 = makeSnap('3', 61)
    const latest = applyTagRules([s1, s2, s3])
    expect(latest.rows[0].tags).toContain('improving')
  })

  test('deteriorating tag', () => {
    const s1 = makeSnap('1', 60)
    const s2 = makeSnap('2', 55)
    const s3 = makeSnap('3', 49)
    const latest = applyTagRules([s1, s2, s3])
    expect(latest.rows[0].tags).toContain('deteriorating')
  })

  test('volatile tag', () => {
    const scores = [50,70,30,70,30,70]
    const snaps = scores.map((sc,i) => makeSnap(String(i), sc))
    const latest = applyTagRules(snaps)
    expect(latest.rows[0].tags).toContain('volatile')
  })
})
