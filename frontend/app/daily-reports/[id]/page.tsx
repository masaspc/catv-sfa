'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dailyReportsApi, DailyReport } from '@/lib/daily-reports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DailyReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth().then(() => {
      if (!user) {
        router.push('/login')
      }
    })
  }, [])

  useEffect(() => {
    if (user) {
      loadReport()
    }
  }, [user, params.id])

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await dailyReportsApi.getDailyReport(parseInt(params.id))
      setReport(data)
    } catch (error) {
      console.error('日報詳細の取得に失敗しました:', error)
      alert('日報情報の取得に失敗しました')
      router.push('/daily-reports')
    } finally {
      setLoading(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>日報が見つかりません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              日報詳細
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(report.report_date).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/daily-reports')}>
            一覧に戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>報告日と勤務時間</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">報告日</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(report.report_date).toLocaleDateString('ja-JP')}
                  </dd>
                </div>
                {report.start_time && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">開始時刻</dt>
                    <dd className="mt-1 text-sm text-gray-900">{report.start_time}</dd>
                  </div>
                )}
                {report.end_time && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">終了時刻</dt>
                    <dd className="mt-1 text-sm text-gray-900">{report.end_time}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* 活動実績 */}
          <Card>
            <CardHeader>
              <CardTitle>活動実績</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <dt className="text-sm text-gray-500">訪問件数</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {report.visits_count || 0}
                  </dd>
                </div>
                <div className="text-center">
                  <dt className="text-sm text-gray-500">新規接触</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {report.new_contacts_count || 0}
                  </dd>
                </div>
                <div className="text-center">
                  <dt className="text-sm text-gray-500">商談件数</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {report.deals_count || 0}
                  </dd>
                </div>
                <div className="text-center">
                  <dt className="text-sm text-gray-500">受注件数</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {report.orders_count || 0}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* 活動内容 */}
          {report.content && (
            <Card>
              <CardHeader>
                <CardTitle>活動内容</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-gray-900">{report.content}</p>
              </CardContent>
            </Card>
          )}

          {/* 気づき・課題 */}
          {report.insights && (
            <Card>
              <CardHeader>
                <CardTitle>今日の気づき・課題</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-gray-900">{report.insights}</p>
              </CardContent>
            </Card>
          )}

          {/* 明日の予定 */}
          {report.tomorrow_plan && (
            <Card>
              <CardHeader>
                <CardTitle>明日の予定</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-gray-900">{report.tomorrow_plan}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
