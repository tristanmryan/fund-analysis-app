import type { NormalisedRow } from '@/utils/parseFundFile'

export interface ScoreDetail {
  raw: number
  final: number
  percentile: number
  breakdown: Record<string, number>
  metricsUsed: number
  totalPossibleMetrics: number
  note?: string
}

export interface Fund extends NormalisedRow {
  scores?: ScoreDetail
  score?: number
  isRecommended?: boolean
  cleanSymbol?: string
}
