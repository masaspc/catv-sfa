'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dailyReportsApi, DailyReportCreate } from '@/lib/daily-reports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function DailyReportNewPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<DailyReportCreate>({
    report_date: new Date().toISOString().split('T')[0],
    visits_count: 0,
    new_contacts_count: 0,
    deals_count: 0,
    orders_count: 0,
  })

  useEffect(() => {
    checkAuth().then(() => {
      if (!user) {
        router.push('/login')
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const newReport = await dailyReportsApi.createDailyReport(formData)
      alert('日報を登録しました')
      router.push(`/daily-reports/${newReport.id}`)
    } catch (error: any) {
      console.error('登録に失敗しました:', error)
      if (error.response?.status === 400) {
        alert('この日付の日報は既に存在します')
      } else {
        alert('日報の登録に失敗しました')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof DailyReportCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || undefined,
    }))
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            日報入力
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            今日の活動を記録してください
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>報告日と勤務時間</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="report_date">報告日 <span className="text-red-500">*</span></Label>
                  <Input
                    id="report_date"
                    type="date"
                    required
                    value={formData.report_date}
                    onChange={(e) => handleChange('report_date', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="start_time">開始時刻</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time || ''}
                      onChange={(e) => handleChange('start_time', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_time">終了時刻</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time || ''}
                      onChange={(e) => handleChange('end_time', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 活動実績 */}
            <Card>
              <CardHeader>
                <CardTitle>活動実績</CardTitle>
                <CardDescription>今日の活動の件数を入力</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <Label htmlFor="visits_count">訪問件数</Label>
                    <Input
                      id="visits_count"
                      type="number"
                      min="0"
                      value={formData.visits_count || 0}
                      onChange={(e) => handleChange('visits_count', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="new_contacts_count">新規接触</Label>
                    <Input
                      id="new_contacts_count"
                      type="number"
                      min="0"
                      value={formData.new_contacts_count || 0}
                      onChange={(e) => handleChange('new_contacts_count', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="deals_count">商談件数</Label>
                    <Input
                      id="deals_count"
                      type="number"
                      min="0"
                      value={formData.deals_count || 0}
                      onChange={(e) => handleChange('deals_count', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="orders_count">受注件数</Label>
                    <Input
                      id="orders_count"
                      type="number"
                      min="0"
                      value={formData.orders_count || 0}
                      onChange={(e) => handleChange('orders_count', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 活動内容 */}
            <Card>
              <CardHeader>
                <CardTitle>活動内容</CardTitle>
                <CardDescription>今日の活動の詳細を記入</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">活動内容</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="今日の活動内容を記入してください"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="insights">今日の気づき・課題</Label>
                  <Textarea
                    id="insights"
                    value={formData.insights || ''}
                    onChange={(e) => handleChange('insights', e.target.value)}
                    placeholder="気づいたことや課題を記入してください"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="tomorrow_plan">明日の予定</Label>
                  <Textarea
                    id="tomorrow_plan"
                    value={formData.tomorrow_plan || ''}
                    onChange={(e) => handleChange('tomorrow_plan', e.target.value)}
                    placeholder="明日の予定を記入してください"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/daily-reports')}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? '登録中...' : '登録'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
