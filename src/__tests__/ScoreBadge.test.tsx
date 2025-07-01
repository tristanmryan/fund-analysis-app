import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScoreBadge from '../components/ScoreBadge'

test('renders score with label', () => {
  render(<ScoreBadge score={55} />)
  expect(screen.getByText('55.0 - Healthy')).toBeInTheDocument()
})

test('hides label when showLabel is false', () => {
  render(<ScoreBadge score={60} showLabel={false} />)
  expect(screen.getByText('60.0')).toBeInTheDocument()
  expect(screen.queryByText(/Strong/)).not.toBeInTheDocument()
})
