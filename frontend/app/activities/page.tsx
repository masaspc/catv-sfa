'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { activitiesApi, Activity } from '@/lib/activities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

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
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  // フィルタ状態
  const [selectedActivityType, setSelectedActivityType] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

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
      setAllActivities(data)
    } catch (error) {
      console.error('営業活動一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルタリングされた活動リスト
  const filteredActivities = useMemo(() => {
    return allActivities.filter((activity) => {
      // 検索クエリフィルタ
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesContent = activity.content?.toLowerCase().includes(query)
        const matchesResult = activity.result?.toLowerCase().includes(query)
        if (!matchesContent && !matchesResult) {
          return false
        }
      }

      // 活動種別フィルタ
      if (selectedActivityType !== 'all' && activity.activity_type !== selectedActivityType) {
        return false
      }

      // 日付範囲フィルタ
      if (startDate && activity.activity_date) {
        const activityDate = new Date(activity.activity_date)
        if (activityDate < new Date(startDate)) {
          return false
        }
      }
      if (endDate && activity.activity_date) {
        const activityDate = new Date(activity.activity_date)
        if (activityDate > new Date(endDate)) {
          return false
        }
      }

      return true
    })
  }, [allActivities, searchQuery, selectedActivityType, startDate, endDate])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedActivityType('all')
    setStartDate('')
    setEndDate('')
  }

  const handleExportCSV = async () => {
    try {
      await activitiesApi.exportToCSV()
    } catch (error) {
      console.error('CSVエクスポートに失敗しました:', error)
      alert('CSVエクスポートに失敗しました')
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
              全{allActivities.length}件中 {filteredActivities.length}件表示
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 検索・フィルタバー */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>活動検索・フィルタ</CardTitle>
                <CardDescription>
                  活動内容で検索し、条件でフィルタできます
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? '詳細フィルタを隠す' : '詳細フィルタを表示'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 検索バー */}
            <div className="flex gap-4">
              <Input
                placeholder="活動内容・結果で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleResetFilters}>
                すべてクリア
              </Button>
            </div>

            {/* 詳細フィルタ */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                {/* 活動種別フィルタ */}
                <div>
                  <Label htmlFor="activity-type-filter">活動種別</Label>
                  <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                    <SelectTrigger id="activity-type-filter">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {Object.entries(activityTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 活動日範囲 */}
                <div>
                  <Label>活動日範囲</Label>
                  <div className="flex gap-2 items-center">
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* 営業活動一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>営業活動一覧</CardTitle>
              <CardDescription>
                クリックして詳細を表示
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                CSVエクスポート
              </Button>
              <Button onClick={() => router.push('/activities/new')}>活動を記録</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>読み込み中...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {allActivities.length === 0 ? '営業活動が見つかりませんでした' : '条件に一致する活動がありません'}
                </p>
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
                      {filteredActivities.map((activity) => (
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
                  {filteredActivities.map((activity) => (
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
