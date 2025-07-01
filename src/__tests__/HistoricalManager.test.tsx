import 'fake-indexeddb/auto'
// polyfill for jest environment
global.structuredClone =
  global.structuredClone || ((v: any) => JSON.parse(JSON.stringify(v)))
;
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import HistoricalManager from '@/routes/HistoricalManager'
import { SnapshotProvider } from '@/contexts/SnapshotContext'
import { addSnapshot } from '@/services/snapshotStore'

const baseSnap = {
  rows: [{ symbol: 'A' }],
  source: 'file.csv',
  checksum: 'x'
}

describe('HistoricalManager', () => {
  beforeEach(async () => {
    const db = (await import('@/services/snapshotStore')).default
    await db.delete()
    await db.open()
    await addSnapshot(baseSnap as any, '2024-01')
  })

  test('renders snapshot list', async () => {
    render(
      <SnapshotProvider>
        <HistoricalManager />
      </SnapshotProvider>
    )
    expect(await screen.findByText('2024-01')).toBeInTheDocument()
  })

  test('filters deleted snapshots', async () => {
    const { softDeleteSnapshot, addSnapshot } = await import('@/services/snapshotStore')
    const altSnap = { ...baseSnap, checksum: 'y' }
    await addSnapshot(altSnap as any, '2024-02')
    await softDeleteSnapshot('2024-02')
    render(
      <SnapshotProvider>
        <HistoricalManager />
      </SnapshotProvider>
    )
    expect(screen.queryByText('2024-02')).not.toBeInTheDocument()
    expect(await screen.findByText('2024-01')).toBeInTheDocument()
  })
})
