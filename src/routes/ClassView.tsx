import React, { useMemo } from 'react'
import FundTable from '@/components/FundTable'
import { useSnapshot } from '@/contexts/SnapshotContext'
import type { Fund } from '@/types/fund'

interface Props {
  defaultAssetClass?: string
}

export default function ClassView ({ defaultAssetClass }: Props) {
  const { active } = useSnapshot()
  const rows: Fund[] = (active?.rows ?? []) as Fund[]

  const funds = useMemo(() => {
    return rows.filter(f =>
      defaultAssetClass ? f.assetClass === defaultAssetClass : true
    )
  }, [rows, defaultAssetClass])

  if (!active) {
    return <div>No snapshot selected</div>
  }

  const benchmark = funds.find(f => f.isBenchmark)
  const peers = funds
    .filter(f => !f.isBenchmark)
    .sort((a, b) => (b.scores?.final || 0) - (a.scores?.final || 0))

  return (
    <div className="class-view">
      <FundTable rows={peers} benchmark={benchmark} />
    </div>
  )
}
