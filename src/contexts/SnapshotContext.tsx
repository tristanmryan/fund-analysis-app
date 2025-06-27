import React, { createContext, useContext, ReactNode, useCallback } from 'react'
import { liveQuery } from 'dexie'
import { useObservable } from 'dexie-react-hooks'
import db, {
  getActiveSnapshot,
  setActiveSnapshot,
  SnapshotRow
} from '../services/snapshotStore'

interface SnapshotCtxShape {
  active: SnapshotRow | undefined
  setActive: (id: string) => Promise<void>
  list: SnapshotRow[]
}

const SnapshotContext = createContext<SnapshotCtxShape | undefined>(undefined)

export function SnapshotProvider ({ children }: { children: ReactNode }) {
  const active = useObservable<SnapshotRow | undefined>(() =>
    liveQuery(getActiveSnapshot)
  )
  const list = useObservable<SnapshotRow[], SnapshotRow[]>(
    () =>
      liveQuery(() =>
        db.snapshots
          .filter(row => row.deleted !== true)
          .toArray()
      ),
    [],
    []
  )

  const setActive = useCallback(async (id: string) => {
    await setActiveSnapshot(id)
  }, [])

  return (
    <SnapshotContext.Provider value={{ active, setActive, list }}>
      {children}
    </SnapshotContext.Provider>
  )
}

export function useSnapshot () {
  const ctx = useContext(SnapshotContext)
  if (!ctx) throw new Error('useSnapshot must be used inside SnapshotProvider')
  return ctx
}
