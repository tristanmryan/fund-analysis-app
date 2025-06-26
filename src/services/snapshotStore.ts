import Dexie, { Table } from 'dexie'
import { ParsedSnapshot } from '../utils/parseFundFile'

export interface SnapshotRow extends ParsedSnapshot {
  /** YYYY-MM e.g. "2024-06" */
  id: string
  uploaded: string
  note?: string | null
  active?: boolean
  deleted?: boolean
}

class SnapshotDB extends Dexie {
  snapshots!: Table<SnapshotRow, string>
  constructor () {
    super('LightshipSnapshots')
    this.version(1).stores({
      snapshots: 'id, uploaded, active'
    })
  }
}

const db = new SnapshotDB()
export default db

export async function addSnapshot (
  snap: ParsedSnapshot,
  id: string,
  note: string | null = null
): Promise<void> {
  const duplicate = await db.snapshots.filter(r => r.checksum === snap.checksum).first()
  if (duplicate) throw new Error('duplicate checksum')
  const row: SnapshotRow = {
    ...snap,
    id,
    uploaded: new Date().toISOString(),
    note,
    active: false
  }
  await db.snapshots.add(row)
}

export async function listSnapshots (): Promise<SnapshotRow[]> {
  return await db.snapshots.toArray()
}

export async function getSnapshot (id: string): Promise<SnapshotRow | undefined> {
  return await db.snapshots.get(id)
}

export async function setActiveSnapshot (id: string): Promise<void> {
  await db.transaction('rw', db.snapshots, async () => {
    await db.snapshots.toCollection().modify(row => { row.active = false })
    await db.snapshots.update(id, { active: true })
  })
}

export async function getActiveSnapshot (): Promise<SnapshotRow | undefined> {
  return await db.snapshots.filter(r => r.active === true).first()
}

export async function softDeleteSnapshot (id: string): Promise<void> {
  await db.snapshots.update(id, { active: false, deleted: true })
}
