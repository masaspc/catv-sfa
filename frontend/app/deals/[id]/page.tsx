'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dealsApi, Deal } from '@/lib/deals'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const dealTypeLabels: { [key: string]: string } = {
  new_individual: '新規個人',
  new_corporate: '新規法人',
  new_property: '新規集合住宅',
  upsell: 'アップセル',
  retention: 'リテンション',
}

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [deal, setDeal] = useState<Deal | null>(null)
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
      loadDeal()
    }
  }, [user, params.id])

  const loadDeal = async () => {
    try {
      setLoading(true)
      const data = await dealsApi.getDeal(parseInt(params.id))
      setDeal(data)
    } catch (error) {
      console.error('案件詳細の取得に失敗しました:', error)
      alert('案件情報の取得に失敗しました')
      router.push('/deals')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの案件を削除しますか？')) {
      return
    }

    try {
      await dealsApi.deleteDeal(parseInt(params.id))
      alert('案件を削除しました')
      router.push('/deals')
    } catch (error) {
      console.error('削除に失敗しました:', error)
      alert('削除に失敗しました。管理者権限が必要です。')
    }
  }

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>案件が見つかりません</p>
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
              案件詳細
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ID: {deal.id}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/deals')}>
            一覧に戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 左カラム - 基本情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>基本情報</CardTitle>
                  <CardDescription>案件の基本的な情報</CardDescription>
                </div>
                <Button onClick={() => router.push(`/deals/${deal.id}/edit`)}>
                  編集
                </Button>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">案件名</dt>
                    <dd className="mt-1 text-sm text-gray-900">{deal.deal_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">案件種別</dt>
                    <dd className="mt-1">
                      <Badge variant="default">
                        {dealTypeLabels[deal.deal_type] || deal.deal_type}
                      </Badge>
                    </dd>
                  </div>
                  {deal.phase && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">フェーズ</dt>
                      <dd className="mt-1 text-sm text-gray-900">{deal.phase}</dd>
                    </div>
                  )}
                  {deal.estimated_amount && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">見積金額</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ¥{deal.estimated_amount.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {deal.probability !== undefined && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">受注確度</dt>
                      <dd className="mt-1 text-sm text-gray-900">{deal.probability}%</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 日程情報 */}
            {(deal.expected_close_date || deal.actual_close_date) && (
              <Card>
                <CardHeader>
                  <CardTitle>日程</CardTitle>
                  <CardDescription>受注予定日・実績日</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {deal.expected_close_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">受注予定日</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(deal.expected_close_date).toLocaleDateString('ja-JP')}
                        </dd>
                      </div>
                    )}
                    {deal.actual_close_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">実際の受注日</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(deal.actual_close_date).toLocaleDateString('ja-JP')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* 関連情報 */}
            <Card>
              <CardHeader>
                <CardTitle>関連情報</CardTitle>
                <CardDescription>顧客・集合住宅との紐付け</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {deal.customer_id && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">顧客ID</dt>
                      <dd className="mt-1">
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={() => router.push(`/customers/${deal.customer_id}`)}
                        >
                          顧客 #{deal.customer_id}
                        </Button>
                      </dd>
                    </div>
                  )}
                  {deal.property_id && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">集合住宅ID</dt>
                      <dd className="mt-1">
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={() => router.push(`/properties/${deal.property_id}`)}
                        >
                          集合住宅 #{deal.property_id}
                        </Button>
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 失注理由 */}
            {deal.lost_reason && (
              <Card>
                <CardHeader>
                  <CardTitle>失注理由</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-gray-900">{deal.lost_reason}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右カラム - アクション・メタ情報 */}
          <div className="space-y-6">
            {/* アクション */}
            <Card>
              <CardHeader>
                <CardTitle>アクション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  営業活動を記録
                </Button>
                <Button className="w-full" variant="outline">
                  フェーズを更新
                </Button>
                <Button className="w-full" variant="outline">
                  受注完了
                </Button>
                {user.role === 'admin' && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleDelete}
                  >
                    案件を削除
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* メタ情報 */}
            <Card>
              <CardHeader>
                <CardTitle>登録情報</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">登録日時</dt>
                    <dd className="text-gray-900">
                      {new Date(deal.created_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                  {deal.updated_at && (
                    <div>
                      <dt className="text-gray-500">最終更新</dt>
                      <dd className="text-gray-900">
                        {new Date(deal.updated_at).toLocaleString('ja-JP')}
                      </dd>
                    </div>
                  )}
                  {deal.sales_person_id && (
                    <div>
                      <dt className="text-gray-500">担当営業</dt>
                      <dd className="text-gray-900">営業員 #{deal.sales_person_id}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
