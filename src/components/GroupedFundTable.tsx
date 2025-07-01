import React, { useState } from 'react'
import BenchmarkRow from './BenchmarkRow.jsx'
import FundTable from './FundTable'
import type { Fund } from '@/types/fund'

export interface GroupedFundTableProps<T extends Fund = Fund> {
  funds?: T[]
  onRowClick?: (fund: T) => void
  deltas?: Record<string, number>
  spark?: Record<string, number[]>
}

/**
 * Group funds by asset class and render expandable sections.
 */
export default function GroupedFundTable<T extends Fund = Fund>({
  funds = [],
  onRowClick = () => {},
  deltas = {},
  spark = {}
}: GroupedFundTableProps<T>) {
  const groups: Record<string, T[]> = {};
  funds.forEach(f => {
    const cls = f.assetClass || 'Uncategorized';
    if (!groups[cls]) groups[cls] = [];
    groups[cls].push(f);
  });

  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (cls: string) =>
    setOpen(prev => ({ ...prev, [cls]: !prev[cls] }));

  return (
    <div>
      {(Object.entries(groups) as [string, T[]][]).map(([cls, rows]) => {
        const benchmark = rows.find(r => r.isBenchmark)
        const peers = rows.filter(r => !r.isBenchmark)
          const avg = peers.length
            ? Math.round(
                peers.reduce((s, f) => s + ((f.score ?? f.scores?.final) || 0), 0) / peers.length
              )
            : 0;
        const benchScore = (benchmark?.score ?? benchmark?.scores?.final) || 0;
        return (
          <div key={cls} className="mb-4">
            <div
              onClick={() => toggle(cls)}
              className="cursor-pointer font-medium flex justify-between py-2 border-b border-gray-200"
            >
              <span>{cls}</span>
              <span>
                Avg {avg}
                {benchScore != null && ` | Benchmark ${benchScore}`}
              </span>
            </div>
            {open[cls] && (
              <div className="mt-2">
                <FundTable rows={peers} benchmark={benchmark} onRowClick={onRowClick} deltas={deltas} spark={spark} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  )
}
