import React from 'react'
import { createRoot } from 'react-dom/client'
import { SnapshotProvider, useSnapshot } from '../src/contexts/SnapshotContext'

function Debug () {
  const { active, list } = useSnapshot()
  return (
    <pre>{JSON.stringify({ active: active?.id, count: list.length }, null, 2)}</pre>
  )
}

const el = document.createElement('div')
document.body.appendChild(el)
createRoot(el).render(
  <SnapshotProvider>
    <Debug />
  </SnapshotProvider>
)
