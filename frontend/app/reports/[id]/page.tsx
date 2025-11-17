'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { reportsApi, Report } from '@/lib/reports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const phaseLabels: { [key: string]: string } = {
  prospecting: '見込み客発掘',
  qualification: '資格確認',
  proposal: '提案',
  negotiation: '交渉',
  closing: 'クロージング',
  won: '受注',
  lost: '失注',
}

const dealTypeLabels: { [key: string]: string } = {
  new_individual: '新規個人',
  new_corporate: '新規法人',
  new_property: '新規集合住宅',
  upsell: 'アップセル',
  retention: 'リテンション',
}

const activityTypeLabels: { [key: string]: string } = {
  visit: '訪問',
  call: '電話',
  email: 'メール',
  meeting: '会議',
  other: 'その他',
}

const contractStatusLabels: { [key: string]: string } = {
  active: '有効',
  expired: '期限切れ',
  cancelled: 'キャンセル',
  pending: '保留中',
}

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, checkAuth } = useAuthStore()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth().then(() => {
      if (!user) {
        router.push('/login')
      }
    })
  }, [])

  useEffect(() => {
    if (user && params.id) {
      loadReport()
    }
  }, [user, params.id])

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await reportsApi.getReport(Number(params.id))
      setReport(data)
    } catch (error) {
      console.error('レポートの取得に失敗しました:', error)
      alert('レポートの取得に失敗しました')
      router.push('/reports')
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
        <p>レポートが見つかりません</p>
      </div>
    )
  }

  const { data } = report

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {report.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(report.period_start).toLocaleDateString('ja-JP')} 〜{' '}
                {new Date(report.period_end).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <Button onClick={() => router.push('/reports')}>
              レポート一覧に戻る
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総案件数</CardDescription>
              <CardTitle className="text-3xl">{data.summary.total_deals}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">
                受注: {data.summary.won_deals} / 失注: {data.summary.lost_deals}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>受注率</CardDescription>
              <CardTitle className="text-3xl">{data.summary.win_rate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">
                {data.summary.won_deals} / {data.summary.total_deals} 案件
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>営業活動</CardDescription>
              <CardTitle className="text-3xl">{data.summary.total_activities}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">
                1日平均: {data.summary.avg_activities_per_day} 件
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>日報提出</CardDescription>
              <CardTitle className="text-3xl">{data.summary.total_daily_reports}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">提出数</p>
            </CardContent>
          </Card>
        </div>

        {/* 収益メトリクス */}
        <Card>
          <CardHeader>
            <CardTitle>収益メトリクス</CardTitle>
            <CardDescription>売上・見込み収益の集計</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">総見積金額</p>
                <p className="text-2xl font-bold">
                  ¥{data.revenue_metrics.total_estimated_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">受注金額</p>
                <p className="text-2xl font-bold text-green-600">
                  ¥{data.revenue_metrics.won_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">見込み収益</p>
                <p className="text-2xl font-bold text-blue-600">
                  ¥{data.revenue_metrics.forecast_revenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">合計予想収益</p>
                <p className="text-2xl font-bold">
                  ¥{data.revenue_metrics.total_revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* フェーズ別案件 */}
          <Card>
            <CardHeader>
              <CardTitle>フェーズ別案件数</CardTitle>
              <CardDescription>案件の進捗状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.deals_by_phase).map(([phase, count]) => (
                  <div key={phase} className="flex justify-between items-center">
                    <span className="text-sm">{phaseLabels[phase] || phase}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 案件種別 */}
          <Card>
            <CardHeader>
              <CardTitle>案件種別</CardTitle>
              <CardDescription>案件タイプの内訳</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.deals_by_type).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm">{dealTypeLabels[type] || type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 活動メトリクス */}
          <Card>
            <CardHeader>
              <CardTitle>営業活動内訳</CardTitle>
              <CardDescription>活動種別ごとの件数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.activity_metrics.by_type).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm">{activityTypeLabels[type] || type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 契約メトリクス */}
          <Card>
            <CardHeader>
              <CardTitle>契約メトリクス</CardTitle>
              <CardDescription>契約の状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">総契約数</p>
                  <p className="text-2xl font-bold">{data.contract_metrics.total_contracts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">総契約金額</p>
                  <p className="text-2xl font-bold">
                    ¥{data.contract_metrics.total_contract_amount.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.entries(data.contract_metrics.by_status).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm">{contractStatusLabels[status] || status}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* トップパフォーマー（全体レポートの場合） */}
        {data.top_performers && data.top_performers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>トップパフォーマー</CardTitle>
              <CardDescription>受注金額上位5名</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.top_performers.map((performer, index) => (
                  <div
                    key={performer.user_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{performer.full_name}</p>
                        <p className="text-sm text-gray-500">
                          受注件数: {performer.won_deals}件
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ¥{performer.won_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
