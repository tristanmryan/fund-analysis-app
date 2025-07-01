import React from 'react'
import { getScoreColor, getScoreLabel } from '@/utils/scoreTags'

export interface ScoreBadgeProps {
  score: number
  showLabel?: boolean
  size?: 'small' | 'normal' | 'large'
}

const SIZE_STYLES = {
  small: { fontSize: '0.75rem', padding: '0.125rem 0.5rem', minWidth: '2.5rem' },
  normal: { fontSize: '0.75rem', padding: '0.25rem 0.5rem', minWidth: '3rem' },
  large: { fontSize: '1rem', padding: '0.375rem 0.75rem', minWidth: '3.5rem' }
} as const

export default function ScoreBadge({
  score,
  showLabel = true,
  size = 'normal'
}: ScoreBadgeProps) {
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  return (
    <span
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}50`,
        borderRadius: '9999px',
        fontWeight: 'bold',
        textAlign: 'center',
        display: 'inline-block',
        ...SIZE_STYLES[size]
      }}
    >
      {Number(score).toFixed(1)}
      {showLabel && ` - ${label}`}
    </span>
  )
}
