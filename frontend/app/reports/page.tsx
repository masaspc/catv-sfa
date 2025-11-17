'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { reportsApi, ReportSummary } from '@/lib/reports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const reportTypeLabels: { [key: string]: string } = {
  monthly: '月次レポート',
  weekly: '週次レポート',
  custom: 'カスタムレポート',
}

export default function ReportsPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [reports, setReports] = useState<ReportSummary[]>([])
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
      loadReports()
    }
  }, [user])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await reportsApi.getReports(0, 100)
      setReports(data)
    } catch (error) {
      console.error('レポート一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このレポートを削除しますか？')) {
      return
    }

    try {
      await reportsApi.deleteReport(id)
      await loadReports()
    } catch (error) {
      console.error('レポートの削除に失敗しました:', error)
      alert('レポートの削除に失敗しました')
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            レポート管理
          </h1>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* レポート一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>生成済みレポート</CardTitle>
              <CardDescription>
                過去に生成したレポートの一覧です
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/reports/generate')}>
              新規レポート生成
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>読み込み中...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">レポートがまだ生成されていません</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push('/reports/generate')}
                >
                  最初のレポートを生成
                </Button>
              </div>
            ) : (
              <>
                {/* デスクトップ表示 */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>タイトル</TableHead>
                        <TableHead>種別</TableHead>
                        <TableHead>期間</TableHead>
                        <TableHead>生成日時</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {reportTypeLabels[report.report_type] || report.report_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(report.period_start).toLocaleDateString('ja-JP')} 〜{' '}
                            {new Date(report.period_end).toLocaleDateString('ja-JP')}
                          </TableCell>
                          <TableCell>
                            {new Date(report.created_at).toLocaleString('ja-JP')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/reports/${report.id}`)}
                              >
                                表示
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(report.id)}
                              >
                                削除
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* モバイル表示 */}
                <div className="md:hidden space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription>
                              {new Date(report.period_start).toLocaleDateString('ja-JP')} 〜{' '}
                              {new Date(report.period_end).toLocaleDateString('ja-JP')}
                            </CardDescription>
                          </div>
                          <Badge variant="default">
                            {reportTypeLabels[report.report_type]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 mb-4">
                          生成日時: {new Date(report.created_at).toLocaleString('ja-JP')}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/reports/${report.id}`)}
                          >
                            表示
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(report.id)}
                          >
                            削除
                          </Button>
                        </div>
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
