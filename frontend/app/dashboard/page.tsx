'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dashboardApi, DashboardKPIs, ActivitiesByType, DealsByPhase } from '@/lib/dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NotificationPanel } from '@/components/notifications/notification-panel'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, checkAuth } = useAuthStore()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [activitiesByType, setActivitiesByType] = useState<ActivitiesByType>({})
  const [dealsByPhase, setDealsByPhase] = useState<DealsByPhase>({})
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
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [kpisData, activitiesData, dealsData] = await Promise.all([
        dashboardApi.getKPIs(),
        dashboardApi.getActivitiesByType(),
        dashboardApi.getDealsByPhase(),
      ])
      setKpis(kpisData)
      setActivitiesByType(activitiesData)
      setDealsByPhase(dealsData)
    } catch (error) {
      console.error('ダッシュボードデータの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
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
            ダッシュボード
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.full_name || user.username} ({user.role})
            </span>
            <Button variant="outline" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* KPIカード */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      今月の訪問件数
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {loading ? '読み込み中...' : `${kpis?.visits_count || 0} 件`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      今月の受注件数
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {loading ? '読み込み中...' : `${kpis?.orders_count || 0} 件`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      目標達成率
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {loading ? '読み込み中...' : `${kpis?.achievement_rate || 0} %`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      有効契約数
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {loading ? '読み込み中...' : `${kpis?.active_contracts_count || 0} 件`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      今月の活動数
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {loading ? '読み込み中...' : `${kpis?.activities_count || 0} 件`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      進行中の案件
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {loading ? '読み込み中...' : `${kpis?.ongoing_deals_count || 0} 件`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      期間
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {loading ? '読み込み中...' : '今月'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button className="h-24" onClick={() => router.push('/daily-reports')}>
              <div className="text-center">
                <div className="text-lg font-semibold">日報入力</div>
                <div className="text-xs mt-1 opacity-80">今日の活動を記録</div>
              </div>
            </Button>
            <Button className="h-24" variant="outline" onClick={() => router.push('/customers')}>
              <div className="text-center">
                <div className="text-lg font-semibold">顧客管理</div>
                <div className="text-xs mt-1 opacity-80">顧客情報を確認</div>
              </div>
            </Button>
            <Button className="h-24" variant="outline" onClick={() => router.push('/deals')}>
              <div className="text-center">
                <div className="text-lg font-semibold">案件管理</div>
                <div className="text-xs mt-1 opacity-80">営業案件を管理</div>
              </div>
            </Button>
            <Button className="h-24" variant="outline" onClick={() => router.push('/properties')}>
              <div className="text-center">
                <div className="text-lg font-semibold">集合住宅</div>
                <div className="text-xs mt-1 opacity-80">物件情報を確認</div>
              </div>
            </Button>
            <Button className="h-24" variant="outline" onClick={() => router.push('/contracts')}>
              <div className="text-center">
                <div className="text-lg font-semibold">契約管理</div>
                <div className="text-xs mt-1 opacity-80">契約情報を管理</div>
              </div>
            </Button>
            <Button className="h-24" variant="outline" onClick={() => router.push('/activities')}>
              <div className="text-center">
                <div className="text-lg font-semibold">営業活動</div>
                <div className="text-xs mt-1 opacity-80">活動履歴を確認</div>
              </div>
            </Button>
            <Button className="h-24" variant="outline" onClick={() => router.push('/reports')}>
              <div className="text-center">
                <div className="text-lg font-semibold">レポート</div>
                <div className="text-xs mt-1 opacity-80">営業レポート生成</div>
              </div>
            </Button>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Button className="h-24" variant="outline" onClick={() => router.push('/settings/email')}>
                <div className="text-center">
                  <div className="text-lg font-semibold">メール通知</div>
                  <div className="text-xs mt-1 opacity-80">通知設定・送信</div>
                </div>
              </Button>
            )}
          </div>
        </div>

        {/* データ可視化セクション */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">データ分析</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 活動種別グラフ */}
            <Card>
              <CardHeader>
                <CardTitle>活動種別（今月）</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-gray-500">読み込み中...</p>
                ) : Object.keys(activitiesByType).length === 0 ? (
                  <p className="text-sm text-gray-500">データがありません</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(activitiesByType).map(([type, count]) => {
                      const maxCount = Math.max(...Object.values(activitiesByType))
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

                      const typeLabels: Record<string, string> = {
                        visit: '訪問',
                        phone: '電話',
                        email: 'メール',
                        meeting: '商談',
                        other: 'その他',
                      }

                      return (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">
                              {typeLabels[type] || type}
                            </span>
                            <span className="text-gray-900 font-semibold">{count}件</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 案件フェーズグラフ */}
            <Card>
              <CardHeader>
                <CardTitle>案件フェーズ分布</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-gray-500">読み込み中...</p>
                ) : Object.keys(dealsByPhase).length === 0 ? (
                  <p className="text-sm text-gray-500">データがありません</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(dealsByPhase).map(([phase, count]) => {
                      const maxCount = Math.max(...Object.values(dealsByPhase))
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

                      const phaseLabels: Record<string, string> = {
                        prospecting: '見込み客発掘',
                        qualification: '資格確認',
                        proposal: '提案',
                        negotiation: '交渉',
                        closing: 'クロージング',
                        won: '受注',
                        lost: '失注',
                      }

                      const phaseColors: Record<string, string> = {
                        prospecting: 'bg-gray-500',
                        qualification: 'bg-yellow-500',
                        proposal: 'bg-blue-500',
                        negotiation: 'bg-orange-500',
                        closing: 'bg-purple-500',
                        won: 'bg-green-600',
                        lost: 'bg-red-500',
                      }

                      return (
                        <div key={phase}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">
                              {phaseLabels[phase] || phase}
                            </span>
                            <span className="text-gray-900 font-semibold">{count}件</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`${phaseColors[phase] || 'bg-gray-600'} h-2.5 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 通知パネル */}        <div className="mt-8">          <NotificationPanel />        </div>

        {/* Phase 3 進行中メッセージ */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Phase 3: DX強化機能 実装中
          </h3>
          <p className="text-sm text-blue-800">
            ✅ Phase 2コア機能完了（顧客・集合住宅・案件・営業活動・日報）<br />
            ✅ 契約管理機能<br />
            ✅ ダッシュボードKPI表示<br />
            ✅ データ可視化（活動種別・案件フェーズグラフ）<br />
            🔄 進行中：検索・フィルタ強化
          </p>
        </div>
      </main>
    </div>
  )
}
