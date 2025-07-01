import React from 'react'
import { Box, Tooltip, Typography } from '@mui/material'
import { useSnapshot } from '@/contexts/SnapshotContext'
import type { SnapshotRow } from '@/services/snapshotStore'
import type { SnapshotFund } from '@/types/analysis'

export function bucket (score: number | null) {
  if (score == null) return 'blank'
  if (score >= 80) return 'top'
  if (score >= 60) return 'good'
  if (score >= 40) return 'weak'
  return 'poor'
}

const colours: Record<string,string> = {
  top:  '#006400',
  good: '#66bb6a',
  weak: '#ef9a9a',
  poor: '#c62828',
  blank:'#e0e0e0'
}

interface HeatmapCell {
  id: string
  score: number | null
}

interface HeatmapRow {
  symbol: string
  cells: HeatmapCell[]
}

export default function AnalysisView () {
  const { list, active } = useSnapshot()
  const last12 = React.useMemo<SnapshotRow[]>(
    () => [...list].sort((a, b) => a.id.localeCompare(b.id)).slice(-12),
    [list]
  )
  if (!active) return <Typography p={3}>No snapshot selected.</Typography>

  // build matrix
  const rows: HeatmapRow[] = active.rows.map((r) => {
    const cells: HeatmapCell[] = last12.map((snap) => {
      const match = snap.rows.find(x => x.symbol === r.symbol) as SnapshotFund | undefined
      return { id: snap.id, score: match?.score ?? null }
    })
    return { symbol: r.symbol, cells }
  })

  return (
    <Box p={3} sx={{ overflowX:'auto' }}>
      <Typography variant="h5" mb={2}>Heat-map (Score by Month)</Typography>

      <Box sx={{ display:'grid',
                 gridTemplateColumns:`120px repeat(${last12.length},36px)` }}>
        {/* header row */}
        <Box />
        {last12.map(s => (
          <Box key={s.id}
               sx={{ textAlign:'center', fontSize:12, px:0.5 }}>{s.id}</Box>
        ))}

        {/* data rows */}
        {rows.map(r => (
          <React.Fragment key={r.symbol}>
            <Box sx={{ fontSize:12, pr:1 }}>{r.symbol}</Box>
            {r.cells.map(c => (
              <Tooltip
                key={c.id}
                title={`${r.symbol} • ${c.id} • ${c.score ?? '—'}`}
                arrow
              >
                <Box sx={{
                  width:34, height:18, m:0.25,
                  bgcolor: colours[bucket(c.score)],
                  borderRadius: '3px'
                }} />
              </Tooltip>
            ))}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  )
}
