import React from 'react'
import { LineChart, Line } from 'recharts'

export default function SparkLine ({ data }: { data: number[] }) {
  if (data.length === 0) return null
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <LineChart width={80} height={24} data={chartData}>
      <Line type="monotone" dataKey="v" strokeWidth={2} dot={false} />
    </LineChart>
  )
}
