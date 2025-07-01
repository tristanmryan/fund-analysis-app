import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';

import { parseFundFile } from '@/utils/parseFundFile';
import { attachScores } from '@/services/scoringUtils';
import { applyTagRules } from '@/services/tagRules';
import { addSnapshot, setActiveSnapshot, default as db } from '@/services/snapshotStore';

export default function UploadDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');


  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);
  const months = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
  ];

  async function handleSave() {
    if (!file || !year || !month) return;

    /* 1 · Parse + enrich -------------------------------------------------- */
    let snap = await parseFundFile(file);
    snap = attachScores(snap);

    const recent = await db.snapshots.orderBy('id').reverse().limit(2).toArray();
    snap = applyTagRules([...recent.reverse(), snap]);

    /* 2 · Persist snapshot (idempotent) ----------------------------------- */
    const id = `${year}-${month}`;
    await addSnapshot(snap, id, 'quick upload');

    /* 3 · Mark snapshot active ------------------------------------------- */
    await setActiveSnapshot(id);

    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upload month-end CSV</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <Button component="label" variant="outlined">
          {file ? file.name : 'Choose CSV'}
          <input
            hidden
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Button>

        <TextField select label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        <TextField select label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!file || !year || !month}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
