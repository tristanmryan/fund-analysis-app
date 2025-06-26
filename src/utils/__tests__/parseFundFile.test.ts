import { parseFundFile } from '../parseFundFile'
import fs from 'fs/promises'
import { File as NodeFile } from 'node:buffer'

// polyfill File for older Node / jsdom environments
(global as any).File = (global as any).File || NodeFile

describe('parseFundFile', () => {
  it('parses Raymond James sample', async () => {
    const buf = await fs.readFile('data/Fund_Performance_Data.csv')
    const file = new File([buf], 'Fund_Performance_Data.csv')
    const snap = await parseFundFile(file)
    expect(snap.rows.length).toBeGreaterThan(100)
    const sample = snap.rows[0]
    expect(sample).toHaveProperty('symbol')
    expect(sample).toHaveProperty('ytdReturn')
  })

  it('parses YCharts sample', async () => {
    const buf = await fs.readFile('data/historical/June2024_FundPerformance.csv')
    const file = new File([buf], 'June2024_FundPerformance.csv')
    const snap = await parseFundFile(file)
    expect(snap.rows.length).toBeGreaterThan(100)
  })
})
