'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { reportsApi, ReportGenerate } from '@/lib/reports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function GenerateReportPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const [reportType, setReportType] = useState<'monthly' | 'weekly' | 'custom'>('monthly')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  const handleGenerateReport = async () => {
    if (!periodStart || !periodEnd) {
      alert('期間を指定してください')
      return
    }

    try {
      setLoading(true)

      // ISO形式に変換
      const startDate = new Date(periodStart)
      const endDate = new Date(periodEnd)
      endDate.setHours(23, 59, 59, 999)

      const data: ReportGenerate = {
        report_type: reportType,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        include_charts: true,
      }

      const report = await reportsApi.generateReport(data)

      // 生成されたレポートを表示
      router.push(`/reports/${report.id}`)
    } catch (error) {
      console.error('レポート生成に失敗しました:', error)
      alert('レポート生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const setPresetPeriod = (preset: 'this_month' | 'last_month' | 'this_week' | 'last_week') => {
    const now = new Date()
    let start: Date, end: Date

    switch (preset) {
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        setReportType('monthly')
        break
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        setReportType('monthly')
        break
      case 'this_week':
        const dayOfWeek = now.getDay()
        start = new Date(now)
        start.setDate(now.getDate() - dayOfWeek)
        end = new Date(now)
        end.setDate(now.getDate() + (6 - dayOfWeek))
        setReportType('weekly')
        break
      case 'last_week':
        const lastWeekDay = now.getDay()
        start = new Date(now)
        start.setDate(now.getDate() - lastWeekDay - 7)
        end = new Date(now)
        end.setDate(now.getDate() - lastWeekDay - 1)
        setReportType('weekly')
        break
    }

    setPeriodStart(start.toISOString().split('T')[0])
    setPeriodEnd(end.toISOString().split('T')[0])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            レポート生成
          </h1>
          <Button onClick={() => router.push('/reports')} variant="outline">
            レポート一覧に戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>レポート生成設定</CardTitle>
            <CardDescription>
              レポートの種別と期間を選択してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* レポート種別 */}
            <div className="space-y-2">
              <Label htmlFor="report-type">レポート種別</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">月次レポート</SelectItem>
                  <SelectItem value="weekly">週次レポート</SelectItem>
                  <SelectItem value="custom">カスタムレポート</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* クイック選択ボタン */}
            <div className="space-y-2">
              <Label>クイック選択</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPresetPeriod('this_month')}
                >
                  今月
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPresetPeriod('last_month')}
                >
                  先月
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPresetPeriod('this_week')}
                >
                  今週
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPresetPeriod('last_week')}
                >
                  先週
                </Button>
              </div>
            </div>

            {/* 期間指定 */}
            <div className="space-y-4">
              <Label>期間指定</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period-start">開始日</Label>
                  <Input
                    id="period-start"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period-end">終了日</Label>
                  <Input
                    id="period-end"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 生成ボタン */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleGenerateReport}
                disabled={loading || !periodStart || !periodEnd}
                className="flex-1"
              >
                {loading ? 'レポート生成中...' : 'レポートを生成'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/reports')}
              >
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 説明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">レポートについて</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>月次レポート:</strong> 月単位での営業成果を集計したレポートです。
              案件の進捗、受注金額、活動実績などをまとめて確認できます。
            </p>
            <p>
              <strong>週次レポート:</strong> 週単位での営業活動を集計したレポートです。
              短期的な目標管理や振り返りに活用できます。
            </p>
            <p>
              <strong>カスタムレポート:</strong> 任意の期間でレポートを生成します。
              特定のキャンペーン期間や四半期など、自由な期間設定が可能です。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
