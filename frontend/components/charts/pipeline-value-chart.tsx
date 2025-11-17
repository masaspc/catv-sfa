'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PipelineValueItem } from '@/lib/dashboard'

interface PipelineValueChartProps {
  data: PipelineValueItem[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function PipelineValueChart({ data }: PipelineValueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>案件パイプライン</CardTitle>
        <CardDescription>フェーズ別の見積金額</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="label" type="category" width={100} />
            <Tooltip
              formatter={(value: number) => `¥${value.toLocaleString()}`}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Bar dataKey="value" name="見積金額">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
