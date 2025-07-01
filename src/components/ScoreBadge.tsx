import React from 'react'
import { getScoreColor, getScoreLabel } from '@/utils/scoreTags'

export interface ScoreBadgeProps {
  score: number
  showLabel?: boolean
  size?: 'small' | 'normal' | 'large'
}

const SIZE_CLASSES = {
  small: 'text-xs px-2 py-0.5 min-w-[2.5rem]',
  normal: 'text-xs px-2 py-1 min-w-[3rem]',
  large: 'text-base px-3 py-1.5 min-w-[3.5rem]'
} as const

export default function ScoreBadge({
  score,
  showLabel = true,
  size = 'normal'
}: ScoreBadgeProps) {
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  const colorClasses = `text-[${color}] bg-[${color}]/20 border-[${color}]/50`

  return (
    <span
      className={`inline-block rounded-full border font-bold text-center ${SIZE_CLASSES[size]} ${colorClasses}`}
    >
      {Number(score).toFixed(1)}
      {showLabel && ` - ${label}`}
    </span>
  )
}
