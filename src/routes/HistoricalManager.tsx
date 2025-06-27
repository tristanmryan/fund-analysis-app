import React, { useState } from 'react'
import {
  Box, Button, IconButton, MenuItem, TextField, Typography,
  Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import UploadIcon from '@mui/icons-material/Upload'
import DownloadIcon from '@mui/icons-material/Download'
import { parseFundFile } from '../utils/parseFundFile'
import { attachScores } from '../services/scoringUtils'
import db, { addSnapshot, softDeleteSnapshot, setActiveSnapshot } from '../services/snapshotStore'
import { applyTagRules } from '../services/tagRules'
import { useSnapshot } from '../contexts/SnapshotContext'
import { buildSnapshotPdf } from '../services/pdfExport'

export default function HistoricalManager () {
  const { active, setActive, list } = useSnapshot()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')

  const years = Array.from({ length: 20 }, (_, i) => 2010 + i).reverse()
  const months = [
    '01','02','03','04','05','06','07','08','09','10','11','12'
  ]

  const handleUpload = async () => {
    if (!file || !year || !month) return
    let snap = await parseFundFile(file)
    snap = attachScores(snap)
    const id = `${year}-${month}`
    const recent = await db.snapshots.orderBy('id').reverse().limit(2).toArray()
    snap = applyTagRules([...recent.reverse(), snap])
    await addSnapshot(snap, id, 'manual upload')
    await setActiveSnapshot(id)
    await setActive(id)
    setOpen(false); setFile(null); setYear(''); setMonth('')
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Historical Data Manager</Typography>

      {/* Upload button */}
      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >Add snapshot</Button>

      {/* Snapshots table */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Date Uploaded</TableCell>
            <TableCell>Rows</TableCell>
            <TableCell>Active?</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map(s => (
            <TableRow key={s.id} hover selected={active?.id === s.id}>
              <TableCell>{s.id}</TableCell>
              <TableCell>{new Date(s.uploaded).toLocaleDateString()}</TableCell>
              <TableCell>{s.rows.length}</TableCell>
              <TableCell>{active?.id === s.id ? '✔' : ''}</TableCell>
              <TableCell align="right">
                <IconButton
                  title="Set active"
                  onClick={() => setActive(s.id)}
                  disabled={active?.id === s.id}
                ><CheckIcon /></IconButton>

                <IconButton
                  title="Download PDF"
                  onClick={async () => {
                    const pdf = await buildSnapshotPdf(s)
                    pdf.save(`Lightship_${s.id}.pdf`)
                  }}
                >
                  <DownloadIcon />
                </IconButton>

                <IconButton
                  title="Delete"
                  color="error"
                  onClick={() => softDeleteSnapshot(s.id)}
                ><DeleteIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Upload dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add snapshot</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <Button component="label" variant="outlined">
            {file ? file.name : 'Choose CSV'}
            <input hidden type="file" accept=".csv, .xlsx" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </Button>

          <TextField
            select label="Year" value={year} onChange={e => setYear(e.target.value)}
          >
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>

          <TextField
            select label="Month" value={month} onChange={e => setMonth(e.target.value)}
          >
            {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!file || !year || !month}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
