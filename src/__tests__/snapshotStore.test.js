import 'fake-indexeddb/auto'
// Jest's jsdom environment may not provide structuredClone
global.structuredClone =
  global.structuredClone || ((v) => JSON.parse(JSON.stringify(v)))
import db, {
  addSnapshot,
  listSnapshots,
  getSnapshot,
  setActiveSnapshot,
  getActiveSnapshot,
  softDeleteSnapshot
} from '../services/snapshotStore'

const baseSnap = {
  rows: [],
  source: 'file.csv',
  checksum: 'abc'
}

describe('snapshotStore', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  afterAll(async () => {
    await db.delete()
  })

  test('addSnapshot and retrieve', async () => {
    await addSnapshot(baseSnap, '2024-06')
    const row = await getSnapshot('2024-06')
    expect(row.id).toBe('2024-06')
  })

  test('duplicate checksum rejected', async () => {
    await addSnapshot(baseSnap, '2024-06')
    await expect(addSnapshot(baseSnap, '2024-07')).rejects.toThrow('duplicate checksum')
  })

  test('setActiveSnapshot toggles active flag', async () => {
    const snapB = { rows: [], source: 'b.csv', checksum: 'b' }
    await addSnapshot(baseSnap, '2024-06')
    await addSnapshot(snapB, '2024-07')
    await setActiveSnapshot('2024-07')
    const active = await getActiveSnapshot()
    expect(active.id).toBe('2024-07')
  })

  test('softDeleteSnapshot flags deletion', async () => {
    await addSnapshot(baseSnap, '2024-06')
    await softDeleteSnapshot('2024-06')
    const row = await getSnapshot('2024-06')
    expect(row.deleted).toBe(true)
    expect(row.active).toBe(false)
  })
})
