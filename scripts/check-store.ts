import { parseFundFile } from '../src/utils/parseFundFile'
import db, { addSnapshot, listSnapshots, setActiveSnapshot, getActiveSnapshot } from '../src/services/snapshotStore'
import fs from 'fs/promises'

;(async () => {
  const buf = await fs.readFile('data/historical/June2024_FundPerformance.csv')
  const file = new File([buf], 'June2024_FundPerformance.csv')
  const snap = await parseFundFile(file)
  await addSnapshot(snap, '2024-06', 'back-fill')
  await setActiveSnapshot('2024-06')
  console.log('Active:', (await getActiveSnapshot())?.id)
  console.log('Total snapshots in DB:', (await listSnapshots()).length)
})()
