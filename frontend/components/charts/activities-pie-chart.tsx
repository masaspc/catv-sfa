'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivitiesByType } from '@/lib/dashboard'

interface ActivitiesPieChartProps {
  data: ActivitiesByType
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const activityTypeLabels: { [key: string]: string } = {
  visit: '訪問',
  call: '電話',
  email: 'メール',
  meeting: '会議',
  other: 'その他',
}

export function ActivitiesPieChart({ data }: ActivitiesPieChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: activityTypeLabels[key] || key,
    value,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>活動種別</CardTitle>
        <CardDescription>今月の活動種別内訳</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
