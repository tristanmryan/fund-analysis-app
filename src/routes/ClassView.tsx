import React, { useMemo } from 'react'
import FundTable from '../components/FundTable.jsx'
import { useSnapshot } from '../contexts/SnapshotContext'
import { NormalisedRow } from '../utils/parseFundFile'

interface Props {
  defaultAssetClass?: string
}

export default function ClassView ({ defaultAssetClass }: Props) {
  const { active } = useSnapshot()
  const rows: NormalisedRow[] = active?.rows ?? []

  const funds = useMemo(() => {
    return (rows as any[]).filter(f =>
      defaultAssetClass ? (f as any).assetClass === defaultAssetClass : true
    )
  }, [rows, defaultAssetClass])

  if (!active) {
    return <div>No snapshot selected</div>
  }

  const benchmark = funds.find(f => (f as any).isBenchmark)
  const peers = funds
    .filter(f => !(f as any).isBenchmark)
    .sort((a, b) => ((b as any).scores?.final || 0) - ((a as any).scores?.final || 0))

  return (
    <div className="class-view">
      <FundTable rows={peers as any} benchmark={benchmark as any} />
    </div>
  )
}
