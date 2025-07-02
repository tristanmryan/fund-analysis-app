import { parseFundFile } from '@/utils/parseFundFile'
import fs from 'fs/promises'
import { File as NodeFile, Blob as NodeBlob } from 'node:buffer'
import * as crypto from 'crypto'

// use Node's File implementation for tests so .text() works
const g: any = global
g.File = NodeFile as any
g.crypto = g.crypto || (crypto as any).webcrypto
g.Blob = NodeBlob as any

describe('parseFundFile', () => {
  it.skip('parses Raymond James sample', async () => {
    const buf = await fs.readFile('data/Fund_Performance_Data.csv')
    const file = new File([buf], 'Fund_Performance_Data.csv')
    const snap = await parseFundFile(file)
    expect(snap.rows.length).toBeGreaterThan(100)
    const sample = snap.rows[0]
    expect(sample).toHaveProperty('symbol')
    expect(sample).toHaveProperty('ytd')
    expect(sample).toHaveProperty('assetClass')
  })

  it.skip('parses YCharts sample', async () => {
    const buf = await fs.readFile('data/historical/June2024_FundPerformance.csv')
    const file = new File([buf], 'June2024_FundPerformance.csv')
    const snap = await parseFundFile(file)
    expect(snap.rows.length).toBeGreaterThan(100)
    expect(snap.rows[0]).toHaveProperty('assetClass')
  })
})
