import db from './snapshotStore'
import { NormalisedRow } from '@/utils/parseFundFile'

/** Return score series (sorted oldest->newest) for given symbol, max N points */
export async function getScoreSeries (symbol: string, limit = 6):
  Promise<{ id: string; score: number }[]> {

  const snaps = await db.snapshots.orderBy('id').reverse().limit(limit).toArray()
  return snaps
    .map(s => {
      const row = s.rows.find(r => r.symbol === symbol)
      return row ? { id: s.id, score: (row as any).score ?? 0 } : null
    })
    .filter(Boolean)
    .reverse() as { id: string; score: number }[]
}

/** MoM delta (current \u2013 previous) */
export function delta (series: { score: number }[]): number | null {
  if (series.length < 2) return null
  const latest = series[series.length - 1]?.score
  const prev   = series[series.length - 2]?.score
  return latest != null && prev != null ? +(latest - prev).toFixed(1) : null
}
