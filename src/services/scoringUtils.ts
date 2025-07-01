import { ParsedSnapshot } from '@/utils/parseFundFile'

const W = { ytd:0.05, one:0.10, three:0.20, five:0.15,
            sharpe:0.25, std:-0.10, exp:-0.10, tenure:0.05 }

/** Add .score to each row using z-scores within its asset class */
export function attachScores (snap: ParsedSnapshot) {
  const rows = snap.rows as any[]
  const classes = Array.from(new Set(rows.map(r => r.assetClass)))
  classes.forEach(cls=>{
    const set = rows.filter(r=>r.assetClass===cls)
    const mean = (key:string)=>set.reduce((a,b)=>a+(+b[key]||0),0)/set.length
    const std  = (key:string)=>Math.sqrt(
      set.reduce((a,b)=>a+Math.pow((+b[key]||0)-mean(key),2),0)/set.length || 1)

    set.forEach(r=>{
      const z = (val:number, key:string)=>(val-mean(key))/std(key)
      const score =
        W.ytd   * z(+r.ytd, 'ytd') +
        W.one   * z(+r.oneYear, 'oneYear') +
        W.three * z(+r.threeYear, 'threeYear') +
        W.five  * z(+r.fiveYear, 'fiveYear') +
        W.sharpe* z(+r.sharpe3Y, 'sharpe3Y') +
        W.std   * z(+r.stdDev3Y||+r.stdDev5Y, 'stdDev3Y') +
        W.exp   * z(+r.expenseRatio, 'expenseRatio') +
        W.tenure* z(+r.managerTenure, 'managerTenure')
      r.score = Math.round((50 + score*10)*10)/10   // clamp roughly 0-100
    })
  })
  return snap
}
