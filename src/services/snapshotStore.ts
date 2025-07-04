import Dexie, { Table } from 'dexie';
import { ParsedSnapshot } from '@/utils/parseFundFile';

/** YYYY-MM, e.g. “2025-05” */
export interface SnapshotRow extends ParsedSnapshot {
  id: string;            // primary key (human-readable)
  uploaded: string;      // ISO timestamp
  note?: string | null;
  active?: boolean;
  deleted?: boolean;
}

/* ─────────────────────────────  Dexie setup  ───────────────────────────── */

class SnapshotDB extends Dexie {
  snapshots!: Table<SnapshotRow, string>;

  constructor() {
    super('LightshipSnapshots');
    this.version(1).stores({
      snapshots: 'id, uploaded, active',
    });
  }
}

const db = new SnapshotDB();
export default db;

/* ───────────────────────────  CRUD helpers  ───────────────────────────── */

/**
 * Add a snapshot exactly once.  
 * ▸ If this checksum already exists → return the existing row’s id.  
 * ▸ Otherwise insert a new row and return its id.
 */
export async function addSnapshot(
  snap: ParsedSnapshot,
  id: string,
  note: string | null = null
): Promise<string> {
  const duplicate = await db.snapshots
    .filter(r => r.checksum === snap.checksum)
    .first();
  if (duplicate) {
    await db.snapshots.update(duplicate.id, { deleted: false });
    return duplicate.id;
  }
  await db.snapshots.add({
    ...snap,
    id,
    uploaded: new Date().toISOString(),
    note,
    active: false,
    deleted: false,
  });
  return id;
}

export async function listSnapshots(): Promise<SnapshotRow[]> {
  return db.snapshots.toArray();
}

export async function getSnapshot(id: string): Promise<SnapshotRow | undefined> {
  return db.snapshots.get(id);
}

export async function setActiveSnapshot(id: string): Promise<void> {
  await db.transaction('rw', db.snapshots, async () => {
    await db.snapshots.toCollection().modify((row) => {
      row.active = false;
    });
    await db.snapshots.update(id, { active: true });
  });
}

export async function getActiveSnapshot(): Promise<SnapshotRow | undefined> {
  return db.snapshots
    .filter((r) => r.active === true && r.deleted !== true)
    .first();
}

export async function softDeleteSnapshot(id: string): Promise<void> {
  await db.snapshots.update(id, { active: false, deleted: true });
}
