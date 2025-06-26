import { ParsedSnapshot } from '../utils/parseFundFile'

export function applyTagRules (snapshots: ParsedSnapshot[]): ParsedSnapshot {
  const latest = snapshots[snapshots.length - 1]
  const prev   = snapshots[snapshots.length - 2]
  const prev2  = snapshots[snapshots.length - 3]

  latest.rows.forEach(row => {
    const history = snapshots
      .slice(-6)
      .map(s => s.rows.find(r => r.symbol === row.symbol))
      .filter(Boolean) as any[]

    const scores = history.map(h => h.score ?? null).filter(n => n != null) as number[]
    const tags: string[] = []

    // Improving / deteriorating
    if (prev && prev2) {
      const curr   = row as any
      const score1 = (prev.rows.find(r => r.symbol === row.symbol) as any)?.score
      const score2 = (prev2.rows.find(r => r.symbol === row.symbol) as any)?.score
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

    ;(row as any).tags = tags
  })

  return latest
}
