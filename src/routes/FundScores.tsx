import React, { useContext, useMemo, useState, useEffect } from 'react'
import GlobalFilterBar from '@/components/Filters/GlobalFilterBar.jsx'
import TagFilterBar from '@/components/Filters/TagFilterBar.jsx'
import FundTable from '@/components/FundTable'
import GroupedFundTable from '@/components/GroupedFundTable'
import FundDetailsModal from '@/components/Modals/FundDetailsModal.jsx'
import AppContext from '@/context/AppContext.jsx'
import { useSnapshot } from '@/contexts/SnapshotContext'
import type { Fund } from '@/types/fund'
import UploadDialog from '@/components/UploadDialog'
import UploadIcon from '@mui/icons-material/Upload'
import { Download } from 'lucide-react'
import { exportToExcel } from '@/services/exportService'
import SparkLine from '@/components/SparkLine'
import { getScoreSeries, delta } from '@/services/trendAnalysis'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Box, Button, Typography } from '@mui/material'
import { savePref, getPref } from '@/services/dataStore'


export default function FundScores () {
  const { active } = useSnapshot()
  console.log('FundScores active snapshot:', active)
  const rows: Fund[] = (active?.rows ?? []) as Fund[]

  const [deltas, setDeltas] = React.useState<Record<string, number>>({})
  const [spark, setSpark] = React.useState<Record<string, number[]>>({})
  const [seriesCache] = React.useState<Record<string, number[]>>({})

  const getSeries = async (symbol: string) => {
    if (!seriesCache[symbol]) {
      const series = await getScoreSeries(symbol, 6)
      seriesCache[symbol] = series.map(s => s.score)
    }
    return seriesCache[symbol]
  }

  const {
    selectedClass,
    selectedTags,
    setSelectedClass,
    toggleTag,
    resetFilters
  } = useContext(AppContext)

  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [grouped, setGrouped] = useState(false)

  const [uploadOpen, setUploadOpen] = useState(false)

  const filteredFunds = useMemo(() => {
    return rows.filter((f: any) => {
      const classMatch = selectedClass ? f.assetClass === selectedClass : true
      const tagMatch = selectedTags.length > 0 ? selectedTags.every(t => f.tags?.includes?.(t)) : true
      return classMatch && tagMatch
    })
  }, [rows, selectedClass, selectedTags])

  useEffect(() => {
    getPref('ls_grouped_view', false).then(setGrouped)
  }, [])

  const toggleView = () => {
    const next = !grouped
    setGrouped(next)
    savePref('ls_grouped_view', next)
  }

  const handleExport = () => {
    if (filteredFunds.length === 0) return
    exportToExcel(filteredFunds)
  }

  React.useEffect(() => {
    (async () => {
      const nextD: Record<string, number> = {}
      const nextS: Record<string, number[]> = {}

      await Promise.all(rows.map(async r => {
        const series = await getSeries(r.symbol)
        nextS[r.symbol] = series
        const d = delta(series.map(s => ({ score: s })))
        if (d != null) nextD[r.symbol] = d
      }))

      setDeltas(nextD); setSpark(nextS)
    })()
  }, [rows])

  if (!active) {
    return (
      <Box p={3} textAlign="center">
        <Typography mb={2}>
          No month selected yet — upload one to get started.
        </Typography>

        <Button variant="contained" onClick={() => setUploadOpen(true)}>
          QUICK UPLOAD
        </Button>

        <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      </Box>
    )
  }

  return (
    <Box>
      <GlobalFilterBar
        availableClasses={[]}
        availableTags={[]}
        selectedClass={selectedClass}
        selectedTags={selectedTags}
        onClassChange={setSelectedClass}
        onTagToggle={toggleTag}
        onReset={resetFilters}
      />
      <TagFilterBar />
      <Box mb={2} display='flex' gap={1}>
        <Button startIcon={<Download />} onClick={handleExport} variant='contained' color='success'>Export to Excel</Button>
        <Button onClick={toggleView} variant='outlined'>{grouped ? 'Flat' : 'Grouped'} View</Button>
        <Button startIcon={<UploadIcon />} onClick={() => setUploadOpen(true)} variant='outlined'>Quick Upload</Button>
      </Box>
      {filteredFunds.length === 0 ? (
        <p className="text-gray-500">No funds match your current filter selection.</p>
      ) : grouped ? (
        <GroupedFundTable funds={filteredFunds} onRowClick={setSelectedFund} deltas={deltas} spark={spark} />
      ) : (
        <FundTable funds={filteredFunds} onRowClick={setSelectedFund} deltas={deltas} spark={spark} />
      )}
      {selectedFund && (
        <FundDetailsModal fund={selectedFund} onClose={() => setSelectedFund(null)} />
      )}
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Box>
  )
}
