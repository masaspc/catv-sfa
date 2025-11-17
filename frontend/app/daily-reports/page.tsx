'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dailyReportsApi, DailyReport } from '@/lib/daily-reports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'

export default function DailyReportsPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [allDailyReports, setAllDailyReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)

  // フィルタ状態
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

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
      setAllDailyReports(data)
    } catch (error) {
      console.error('日報一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルタリングされた日報リスト
  const filteredDailyReports = useMemo(() => {
    return allDailyReports.filter((report) => {
      // 日付範囲フィルタ
      if (startDate && report.report_date) {
        const reportDate = new Date(report.report_date)
        if (reportDate < new Date(startDate)) {
          return false
        }
      }
      if (endDate && report.report_date) {
        const reportDate = new Date(report.report_date)
        if (reportDate > new Date(endDate)) {
          return false
        }
      }
      return true
    })
  }, [allDailyReports, startDate, endDate])

  const handleResetFilters = () => {
    setStartDate('')
    setEndDate('')
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
              全{allDailyReports.length}件中 {filteredDailyReports.length}件表示
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* フィルタバー */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>日付フィルタ</CardTitle>
            <CardDescription>
              報告日で絞り込みできます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>報告日範囲</Label>
                <div className="flex gap-2 items-center mt-1">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-gray-500">〜</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleResetFilters}>
                クリア
              </Button>
            </div>
          </CardContent>
        </Card>

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
            ) : filteredDailyReports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {allDailyReports.length === 0 ? '日報が見つかりませんでした' : '条件に一致する日報がありません'}
                </p>
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
                      {filteredDailyReports.map((report) => (
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
                  {filteredDailyReports.map((report) => (
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
