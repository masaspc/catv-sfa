'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueTrendItem } from '@/lib/dashboard'

interface RevenueTrendChartProps {
  data: RevenueTrendItem[]
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>売上推移</CardTitle>
        <CardDescription>過去6ヶ月の月別受注金額</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `¥${value.toLocaleString()}`}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#2563eb" name="受注金額" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
