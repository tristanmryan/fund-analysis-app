import { ParsedSnapshot } from '../utils/parseFundFile'

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
        W.ytd   * z(+r.ytdReturn, 'ytdReturn') +
        W.one   * z(+r.oneYearReturn, 'oneYearReturn') +
        W.three * z(+r.threeYearReturn, 'threeYearReturn') +
        W.five  * z(+r.fiveYearReturn, 'fiveYearReturn') +
        W.sharpe* z(+r.sharpe3y, 'sharpe3y') +
        W.std   * z(+r.stdDev3y||+r.stdDev5y, 'stdDev3y') +
        W.exp   * z(+r.netExpenseRatio, 'netExpenseRatio') +
        W.tenure* z(+r.managerTenure, 'managerTenure')
      r.score = Math.round((50 + score*10)*10)/10   // clamp roughly 0-100
    })
  })
  return snap
}
