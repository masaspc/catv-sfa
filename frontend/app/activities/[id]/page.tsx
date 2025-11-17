'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { activitiesApi, Activity } from '@/lib/activities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const activityTypeLabels: { [key: string]: string } = {
  visit: '訪問',
  call: '電話',
  email: 'メール',
  meeting: '打ち合わせ',
  other: 'その他',
}

const activityTypeBadgeVariant: { [key: string]: 'default' | 'success' | 'warning' | 'error' | 'secondary' } = {
  visit: 'success',
  call: 'default',
  email: 'secondary',
  meeting: 'warning',
  other: 'secondary',
}

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [activity, setActivity] = useState<Activity | null>(null)
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
      loadActivity()
    }
  }, [user, params.id])

  const loadActivity = async () => {
    try {
      setLoading(true)
      const data = await activitiesApi.getActivity(parseInt(params.id))
      setActivity(data)
    } catch (error) {
      console.error('営業活動詳細の取得に失敗しました:', error)
      alert('営業活動情報の取得に失敗しました')
      router.push('/activities')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの営業活動を削除しますか？')) {
      return
    }

    try {
      await activitiesApi.deleteActivity(parseInt(params.id))
      alert('営業活動を削除しました')
      router.push('/activities')
    } catch (error) {
      console.error('削除に失敗しました:', error)
      alert('削除に失敗しました')
    }
  }

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>営業活動が見つかりません</p>
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
              営業活動詳細
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ID: {activity.id}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/activities')}>
            一覧に戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 左カラム - 詳細情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>基本情報</CardTitle>
                  <CardDescription>営業活動の基本的な情報</CardDescription>
                </div>
                <Button onClick={() => router.push(`/activities/${activity.id}/edit`)}>
                  編集
                </Button>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">活動日時</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(activity.activity_date).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">活動種別</dt>
                    <dd className="mt-1">
                      <Badge variant={activityTypeBadgeVariant[activity.activity_type]}>
                        {activityTypeLabels[activity.activity_type] || activity.activity_type}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* 活動内容 */}
            {activity.content && (
              <Card>
                <CardHeader>
                  <CardTitle>活動内容</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-gray-900">{activity.content}</p>
                </CardContent>
              </Card>
            )}

            {/* 実施結果 */}
            {activity.result && (
              <Card>
                <CardHeader>
                  <CardTitle>実施結果</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-gray-900">{activity.result}</p>
                </CardContent>
              </Card>
            )}

            {/* 次回アクション */}
            {(activity.next_action || activity.next_action_date) && (
              <Card>
                <CardHeader>
                  <CardTitle>次回アクション</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    {activity.next_action && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">アクション内容</dt>
                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                          {activity.next_action}
                        </dd>
                      </div>
                    )}
                    {activity.next_action_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">実施予定日時</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(activity.next_action_date).toLocaleString('ja-JP')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* 関連情報 */}
            {(activity.customer_id || activity.property_id || activity.deal_id) && (
              <Card>
                <CardHeader>
                  <CardTitle>関連情報</CardTitle>
                  <CardDescription>顧客・集合住宅・案件との紐付け</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {activity.customer_id && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">顧客</dt>
                        <dd className="mt-1">
                          <Button
                            variant="link"
                            className="h-auto p-0"
                            onClick={() => router.push(`/customers/${activity.customer_id}`)}
                          >
                            顧客 #{activity.customer_id}
                          </Button>
                        </dd>
                      </div>
                    )}
                    {activity.property_id && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">集合住宅</dt>
                        <dd className="mt-1">
                          <Button
                            variant="link"
                            className="h-auto p-0"
                            onClick={() => router.push(`/properties/${activity.property_id}`)}
                          >
                            集合住宅 #{activity.property_id}
                          </Button>
                        </dd>
                      </div>
                    )}
                    {activity.deal_id && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">案件</dt>
                        <dd className="mt-1">
                          <Button
                            variant="link"
                            className="h-auto p-0"
                            onClick={() => router.push(`/deals/${activity.deal_id}`)}
                          >
                            案件 #{activity.deal_id}
                          </Button>
                        </dd>
                      </div>
                    )}
                  </dl>
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
                  フォローアップ活動を記録
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleDelete}
                >
                  活動を削除
                </Button>
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
                      {new Date(activity.created_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                  {activity.updated_at && (
                    <div>
                      <dt className="text-gray-500">最終更新</dt>
                      <dd className="text-gray-900">
                        {new Date(activity.updated_at).toLocaleString('ja-JP')}
                      </dd>
                    </div>
                  )}
                  {activity.sales_person_id && (
                    <div>
                      <dt className="text-gray-500">担当営業</dt>
                      <dd className="text-gray-900">営業員 #{activity.sales_person_id}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 位置情報 */}
            {(activity.latitude || activity.longitude) && (
              <Card>
                <CardHeader>
                  <CardTitle>位置情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    {activity.latitude && (
                      <div>
                        <dt className="text-gray-500">緯度</dt>
                        <dd className="text-gray-900">{activity.latitude}</dd>
                      </div>
                    )}
                    {activity.longitude && (
                      <div>
                        <dt className="text-gray-500">経度</dt>
                        <dd className="text-gray-900">{activity.longitude}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
