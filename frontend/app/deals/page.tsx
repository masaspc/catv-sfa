'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dealsApi, Deal } from '@/lib/deals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const dealTypeLabels: { [key: string]: string } = {
  new_individual: '新規個人',
  new_corporate: '新規法人',
  new_property: '新規集合住宅',
  upsell: 'アップセル',
  retention: 'リテンション',
}

export default function DealsPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkAuth().then(() => {
      if (!user) {
        router.push('/login')
      }
    })
  }, [])

  useEffect(() => {
    if (user) {
      loadDeals()
    }
  }, [user])

  const loadDeals = async () => {
    try {
      setLoading(true)
      const data = await dealsApi.getDeals(0, 100)
      setDeals(data)
    } catch (error) {
      console.error('案件一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDeals()
      return
    }

    try {
      setLoading(true)
      const data = await dealsApi.searchDeals(searchQuery)
      setDeals(data)
    } catch (error) {
      console.error('検索に失敗しました:', error)
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
              案件管理
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              全{deals.length}件の案件
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 検索バー */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>案件検索</CardTitle>
            <CardDescription>
              案件名で検索できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="検索キーワードを入力..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>検索</Button>
              <Button variant="outline" onClick={loadDeals}>
                リセット
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 案件一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>案件一覧</CardTitle>
              <CardDescription>
                クリックして詳細を表示
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/deals/new')}>新規案件登録</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>読み込み中...</p>
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">案件が見つかりませんでした</p>
              </div>
            ) : (
              <>
                {/* デスクトップ表示 */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>案件名</TableHead>
                        <TableHead>案件種別</TableHead>
                        <TableHead>フェーズ</TableHead>
                        <TableHead>見積金額</TableHead>
                        <TableHead>受注確度</TableHead>
                        <TableHead>受注予定日</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deals.map((deal) => (
                        <TableRow
                          key={deal.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/deals/${deal.id}`)}
                        >
                          <TableCell className="font-medium">{deal.deal_name}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {dealTypeLabels[deal.deal_type] || deal.deal_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{deal.phase || '-'}</TableCell>
                          <TableCell>
                            {deal.estimated_amount ? `¥${deal.estimated_amount.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>{deal.probability ? `${deal.probability}%` : '-'}</TableCell>
                          <TableCell>
                            {deal.expected_close_date
                              ? new Date(deal.expected_close_date).toLocaleDateString('ja-JP')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* モバイル表示 */}
                <div className="md:hidden space-y-4">
                  {deals.map((deal) => (
                    <Card
                      key={deal.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/deals/${deal.id}`)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{deal.deal_name}</CardTitle>
                            <CardDescription>{deal.phase || 'フェーズ未設定'}</CardDescription>
                          </div>
                          <Badge variant="default">
                            {dealTypeLabels[deal.deal_type]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          {deal.estimated_amount && (
                            <div>
                              <dt className="text-gray-500">見積金額</dt>
                              <dd>¥{deal.estimated_amount.toLocaleString()}</dd>
                            </div>
                          )}
                          {deal.probability && (
                            <div>
                              <dt className="text-gray-500">受注確度</dt>
                              <dd>{deal.probability}%</dd>
                            </div>
                          )}
                          {deal.expected_close_date && (
                            <div>
                              <dt className="text-gray-500">受注予定日</dt>
                              <dd>{new Date(deal.expected_close_date).toLocaleDateString('ja-JP')}</dd>
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
