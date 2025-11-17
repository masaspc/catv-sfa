'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dailyReportsApi, DailyReport } from '@/lib/daily-reports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function DailyReportsPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
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
      loadDailyReports()
    }
  }, [user])

  const loadDailyReports = async () => {
    try {
      setLoading(true)
      const data = await dailyReportsApi.getDailyReports(0, 100)
      setDailyReports(data)
    } catch (error) {
      console.error('日報一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
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
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              日報管理
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              全{dailyReports.length}件の日報
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 日報一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>日報一覧</CardTitle>
              <CardDescription>
                クリックして詳細を表示
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/daily-reports/new')}>日報を入力</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>読み込み中...</p>
              </div>
            ) : dailyReports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">日報が見つかりませんでした</p>
              </div>
            ) : (
              <>
                {/* デスクトップ表示 */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>報告日</TableHead>
                        <TableHead>訪問件数</TableHead>
                        <TableHead>新規接触</TableHead>
                        <TableHead>商談件数</TableHead>
                        <TableHead>受注件数</TableHead>
                        <TableHead>勤務時間</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyReports.map((report) => (
                        <TableRow
                          key={report.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/daily-reports/${report.id}`)}
                        >
                          <TableCell className="font-medium">
                            {new Date(report.report_date).toLocaleDateString('ja-JP')}
                          </TableCell>
                          <TableCell>{report.visits_count || 0}件</TableCell>
                          <TableCell>{report.new_contacts_count || 0}件</TableCell>
                          <TableCell>{report.deals_count || 0}件</TableCell>
                          <TableCell>{report.orders_count || 0}件</TableCell>
                          <TableCell>
                            {report.start_time && report.end_time
                              ? `${report.start_time} - ${report.end_time}`
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* モバイル表示 */}
                <div className="md:hidden space-y-4">
                  {dailyReports.map((report) => (
                    <Card
                      key={report.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/daily-reports/${report.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {new Date(report.report_date).toLocaleDateString('ja-JP')}
                        </CardTitle>
                        {report.start_time && report.end_time && (
                          <CardDescription>
                            {report.start_time} - {report.end_time}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <dt className="text-gray-500">訪問</dt>
                            <dd className="font-medium">{report.visits_count || 0}件</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">新規接触</dt>
                            <dd className="font-medium">{report.new_contacts_count || 0}件</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">商談</dt>
                            <dd className="font-medium">{report.deals_count || 0}件</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">受注</dt>
                            <dd className="font-medium">{report.orders_count || 0}件</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
