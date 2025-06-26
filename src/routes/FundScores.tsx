import React, { useContext, useMemo, useState } from 'react'
import GlobalFilterBar from '../components/Filters/GlobalFilterBar.jsx'
import TagFilterBar from '../components/Filters/TagFilterBar.jsx'
import FundTable from '../components/FundTable.jsx'
import GroupedFundTable from '../components/GroupedFundTable.jsx'
import FundDetailsModal from '../components/Modals/FundDetailsModal.jsx'
import AppContext from '../context/AppContext.jsx'
import { useSnapshot } from '../contexts/SnapshotContext'
import { NormalisedRow, parseFundFile } from '../utils/parseFundFile'
import { addSnapshot, setActiveSnapshot } from '../services/snapshotStore'
import UploadIcon from '@mui/icons-material/Upload'
import { Download } from 'lucide-react'
import { exportToExcel } from '../services/exportService'
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem
} from '@mui/material'

const GroupedTable: React.FC<any> = GroupedFundTable as unknown as React.FC<any>
const FundTableAny: React.FC<any> = FundTable as unknown as React.FC<any>

const years = Array.from({ length: 20 }, (_, i) => 2010 + i).reverse()
const months = ['01','02','03','04','05','06','07','08','09','10','11','12']

export default function FundScores () {
  const { active } = useSnapshot()
  const rows: NormalisedRow[] = active?.rows ?? []

  const {
    selectedClass,
    selectedTags,
    setSelectedClass,
    toggleTag,
    resetFilters
  } = useContext(AppContext)

  const [selectedFund, setSelectedFund] = useState<any>(null)
  const [grouped, setGrouped] = useState(() => localStorage.getItem('ls_grouped_view') === 'true')

  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')

  const handleQuickUpload = async () => {
    if (!file || !year || !month) return
    const snap = await parseFundFile(file)
    const id = `${year}-${month}`
    await addSnapshot(snap, id, 'quick upload')
    await setActiveSnapshot(id)
    setOpen(false); setFile(null); setYear(''); setMonth('')
  }

  const filteredFunds = useMemo(() => {
    return rows.filter((f: any) => {
      const classMatch = selectedClass ? f.assetClass === selectedClass : true
      const tagMatch = selectedTags.length > 0 ? selectedTags.every(t => f.tags?.includes?.(t)) : true
      return classMatch && tagMatch
    })
  }, [rows, selectedClass, selectedTags])

  const toggleView = () => {
    const next = !grouped
    setGrouped(next)
    localStorage.setItem('ls_grouped_view', String(next))
  }

  const handleExport = () => {
    if (filteredFunds.length === 0) return
    exportToExcel(filteredFunds)
  }

  if (!active) {
    return (
      <Box p={3} textAlign='center'>
        <Button variant='contained' startIcon={<UploadIcon />} onClick={() => setOpen(true)}>Quick Upload</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Quick Upload</DialogTitle>
          <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
            <Button component='label' variant='outlined'>
              {file ? file.name : 'Choose CSV'}
              <input hidden type='file' accept='.csv,.xlsx' onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </Button>
            <TextField select label='Year' value={year} onChange={e => setYear(e.target.value)}>
              {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
            <TextField select label='Month' value={month} onChange={e => setMonth(e.target.value)}>
              {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleQuickUpload} variant='contained' disabled={!file || !year || !month}>Save</Button>
          </DialogActions>
        </Dialog>
        <Box mt={4}>No snapshot selected – upload one or pick from Historical Data.</Box>
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
        <Button startIcon={<UploadIcon />} onClick={() => setOpen(true)} variant='outlined'>Quick Upload</Button>
      </Box>
      {filteredFunds.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No funds match your current filter selection.</p>
      ) : grouped ? (
        <GroupedTable funds={filteredFunds as any} onRowClick={setSelectedFund} />
      ) : (
        <FundTableAny funds={filteredFunds as any} onRowClick={setSelectedFund as any} />
      )}
      {selectedFund && (
        <FundDetailsModal fund={selectedFund} onClose={() => setSelectedFund(null)} />
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Quick Upload</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <Button component='label' variant='outlined'>
            {file ? file.name : 'Choose CSV'}
            <input hidden type='file' accept='.csv,.xlsx' onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </Button>
          <TextField select label='Year' value={year} onChange={e => setYear(e.target.value)}>
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <TextField select label='Month' value={month} onChange={e => setMonth(e.target.value)}>
            {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleQuickUpload} variant='contained' disabled={!file || !year || !month}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
