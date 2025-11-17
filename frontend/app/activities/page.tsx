'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { activitiesApi, Activity } from '@/lib/activities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

export default function ActivitiesPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [activities, setActivities] = useState<Activity[]>([])
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
      loadActivities()
    }
  }, [user])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const data = await activitiesApi.getActivities(0, 100)
      setActivities(data)
    } catch (error) {
      console.error('営業活動一覧の取得に失敗しました:', error)
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
              営業活動管理
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              全{activities.length}件の活動
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 営業活動一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>営業活動一覧</CardTitle>
              <CardDescription>
                クリックして詳細を表示
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/activities/new')}>活動を記録</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>読み込み中...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">営業活動が見つかりませんでした</p>
              </div>
            ) : (
              <>
                {/* デスクトップ表示 */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>活動日時</TableHead>
                        <TableHead>活動種別</TableHead>
                        <TableHead>内容</TableHead>
                        <TableHead>結果</TableHead>
                        <TableHead>次回アクション</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity) => (
                        <TableRow
                          key={activity.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/activities/${activity.id}`)}
                        >
                          <TableCell className="font-medium">
                            {new Date(activity.activity_date).toLocaleString('ja-JP')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={activityTypeBadgeVariant[activity.activity_type]}>
                              {activityTypeLabels[activity.activity_type] || activity.activity_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {activity.content ? (
                              <div className="truncate max-w-xs">{activity.content}</div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {activity.result ? (
                              <div className="truncate max-w-xs">{activity.result}</div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {activity.next_action ? (
                              <div className="truncate max-w-xs">{activity.next_action}</div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* モバイル表示 */}
                <div className="md:hidden space-y-4">
                  {activities.map((activity) => (
                    <Card
                      key={activity.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/activities/${activity.id}`)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {new Date(activity.activity_date).toLocaleDateString('ja-JP')}
                            </CardTitle>
                            <CardDescription>
                              {new Date(activity.activity_date).toLocaleTimeString('ja-JP')}
                            </CardDescription>
                          </div>
                          <Badge variant={activityTypeBadgeVariant[activity.activity_type]}>
                            {activityTypeLabels[activity.activity_type]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          {activity.content && (
                            <div>
                              <dt className="text-gray-500">内容</dt>
                              <dd className="line-clamp-2">{activity.content}</dd>
                            </div>
                          )}
                          {activity.result && (
                            <div>
                              <dt className="text-gray-500">結果</dt>
                              <dd className="line-clamp-2">{activity.result}</dd>
                            </div>
                          )}
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
