import { buildSnapshotPdf } from '../pdfExport'
import { ParsedSnapshot } from '@/utils/parseFundFile'

describe('buildSnapshotPdf', () => {
  test('returns landscape jsPDF instance', async () => {
    const snap: ParsedSnapshot = {
      id: '2024-06',
      rows: Array.from({ length: 6 }, (_, i) => ({
        symbol: `F${i}`,
        score: 60 - i * 5,
        delta: i,
        assetClass: i % 2 ? 'A' : 'B',
        tags: ['improving']
      })) as any[],
      source: 'x',
      checksum: 'c'
    }
    const pdf = await buildSnapshotPdf(snap)
    expect(typeof (pdf as any).save).toBe('function')
    expect(pdf.internal.pageSize.width).toBeGreaterThan(pdf.internal.pageSize.height)
  })
})
