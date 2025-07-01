import type { ParsedSnapshot } from '@/utils/parseFundFile'
import type { SnapshotFund } from '@/types/analysis'

export function applyTagRules (snapshots: ParsedSnapshot[]): ParsedSnapshot {
  const latest = snapshots[snapshots.length - 1]
  const prev   = snapshots[snapshots.length - 2]
  const prev2  = snapshots[snapshots.length - 3]

  latest.rows.forEach((row) => {
    const curr = row as SnapshotFund
    const history: SnapshotFund[] = snapshots
      .slice(-6)
      .map(s => s.rows.find(r => r.symbol === curr.symbol))
      .filter((r): r is SnapshotFund => Boolean(r))

    const scores = history.map(h => h.score).filter(n => n != null)
    const tags: string[] = []

    // Improving / deteriorating
    if (prev && prev2) {
      const score1 = (prev.rows.find(r => r.symbol === curr.symbol) as SnapshotFund | undefined)?.score
      const score2 = (prev2.rows.find(r => r.symbol === curr.symbol) as SnapshotFund | undefined)?.score
      if (score1 != null && score2 != null) {
        if (curr.score - score1 >= 5 && score1 - score2 > 0) tags.push('improving')
        if (curr.score - score1 <= -5 && score1 - score2 < 0) tags.push('deteriorating')
      }
    }

    // Volatile
    if (scores.length >= 6) {
      const avg = scores.reduce((a,b)=>a+b,0)/scores.length
      const sd  = Math.sqrt(scores.map(x => (x-avg)**2).reduce((a,b)=>a+b,0)/scores.length)
      if (sd >= 15) tags.push('volatile')
    }

    curr.tags = tags
  })

  return latest
}
