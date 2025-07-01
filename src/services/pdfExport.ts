import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface AutoTableDoc extends jsPDF {
  lastAutoTable?: { finalY: number }
}
import type { ParsedSnapshot } from '@/utils/parseFundFile'
import type { SnapshotFund } from '@/types/analysis'

export async function buildSnapshotPdf (snap: ParsedSnapshot) {
  const doc: AutoTableDoc = new jsPDF({ orientation: 'landscape' }) as AutoTableDoc

  // Header
  doc.setFontSize(18)
  doc.text(`Lightship Fund Analysis • ${snap.id}`, 14, 14)
  doc.setFontSize(10)
  doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, 20)

  const scoreRows = snap.rows as SnapshotFund[]
  const sort = (asc = true) =>
    [...scoreRows]
      .sort((a, b) => (asc ? 1 : -1) * (b.score - a.score))
      .slice(0, 5)

  // Top performers
  autoTable(doc, {
    startY: 26,
    head: [['Top 5 (Score)', 'Score', 'Δ']],
    body: sort(false).map(r => [`${r.symbol}`, r.score, r.delta ?? '']),
    theme: 'grid'
  })

  // Bottom performers
  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 26) + 4,
    head: [['Bottom 5 (Score)', 'Score', 'Δ']],
    body: sort(true).map(r => [`${r.symbol}`, r.score, r.delta ?? '']),
    theme: 'grid'
  })

  // Tag summary
  const tagCounts = snap.rows.reduce<Record<string, number>>((acc, r) => {
    (r.tags ?? []).forEach((t) => (acc[t] = (acc[t] ?? 0) + 1))
    return acc
  }, {})
  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 26) + 4,
    head: [['Tag', 'Count']],
    body: Object.entries(tagCounts),
    theme: 'plain'
  })

  // Asset-class averages
  const cls: Record<string, { sum: number; cnt: number }> = {}
  scoreRows.forEach(r => {
    const c = r.assetClass ?? 'Other'
    cls[c] ??= { sum: 0, cnt: 0 }
    cls[c].sum += r.score
    cls[c].cnt++
  })
  const labels = Object.keys(cls)
  const avgs = labels.map(k => +(cls[k].sum / cls[k].cnt).toFixed(1))

  const chartX = 190
  const chartY = 26
  const maxH = 40
  const maxV = Math.max(...avgs, 100)
  labels.forEach((l, i) => {
    const h = (avgs[i] / maxV) * maxH
    doc.setFillColor(100, 149, 237)
    doc.rect(chartX + i * 10, chartY + maxH - h, 8, h, 'F')
  })
  doc.setFontSize(8)
  labels.forEach((l, i) => {
    doc.text(String(avgs[i]), chartX + i * 10, chartY + maxH + 4, {
      align: 'center'
    })
  })

  return doc
}
