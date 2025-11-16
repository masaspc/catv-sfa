'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth().then(() => {
      if (!user) {
        router.push('/login')
      }
    })
  }, [])

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                      -- 件
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
                      -- 件
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
                      -- %
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
          </div>
        </div>

        {/* Phase 2 進行中メッセージ */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Phase 2: コア機能実装 進行中
          </h3>
          <p className="text-sm text-green-800">
            顧客管理、集合住宅管理の実装が完了しました。<br />
            ✅ 顧客一覧・検索機能<br />
            ✅ 集合住宅一覧・検索機能<br />
            次は案件管理、営業活動管理、日報機能を実装予定です。
          </p>
        </div>
      </main>
    </div>
  )
}
