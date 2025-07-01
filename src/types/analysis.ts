export interface ScoreSeriesEntry {
  id: string;
  score: number;
}

import type { ParsedSnapshot } from '@/utils/parseFundFile';
import type { Fund } from '@/types/fund';

export interface SnapshotFund extends Fund {
  score: number;
  delta?: number;
}

export interface ScoredSnapshot extends Omit<ParsedSnapshot, 'rows'> {
  rows: SnapshotFund[];
}
