import { parseFundFile } from '../src/utils/parseFundFile'
import fs from 'fs/promises'

;(async () => {
  const file = new File(
    [await fs.readFile('data/historical/June2024_FundPerformance.csv')],
    'June2024_FundPerformance.csv'
  )
  const snap = await parseFundFile(file)
  console.log(`${snap.rows.length} rows parsed OK`)
})()
