'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WinRateTrendItem } from '@/lib/dashboard'

interface WinRateTrendChartProps {
  data: WinRateTrendItem[]
}

export function WinRateTrendChart({ data }: WinRateTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>受注率推移</CardTitle>
        <CardDescription>過去6ヶ月の受注率トレンド</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(value: number) => `${value}%`}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#10b981"
              strokeWidth={2}
              name="受注率（%）"
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
