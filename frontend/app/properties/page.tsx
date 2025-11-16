'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { propertiesApi, Property } from '@/lib/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const catvStatusLabels: { [key: string]: string } = {
  not_introduced: '未導入',
  bulk_contract: '一括導入済',
  individual_available: '個別契約可',
}

const salesStatusLabels: { [key: string]: string } = {
  not_contacted: '未接触',
  proposing: '提案中',
  considering: '検討中',
  decided: '導入決定',
  declined: '見送り',
}

const salesStatusBadgeVariant: { [key: string]: 'default' | 'success' | 'warning' | 'error' | 'secondary' } = {
  not_contacted: 'secondary',
  proposing: 'default',
  considering: 'warning',
  decided: 'success',
  declined: 'error',
}

export default function PropertiesPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
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
      loadProperties()
    }
  }, [user])

  const loadProperties = async () => {
    try {
      setLoading(true)
      const data = await propertiesApi.getProperties(0, 100)
      setProperties(data.items)
      setTotal(data.total)
    } catch (error) {
      console.error('集合住宅一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProperties()
      return
    }

    try {
      setLoading(true)
      const data = await propertiesApi.searchProperties(searchQuery)
      setProperties(data)
      setTotal(data.length)
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
              集合住宅管理
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              全{total}件の物件
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
            <CardTitle>物件検索</CardTitle>
            <CardDescription>
              物件名、住所で検索できます
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
              <Button variant="outline" onClick={loadProperties}>
                リセット
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 集合住宅一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>集合住宅一覧</CardTitle>
              <CardDescription>
                クリックして詳細を表示
              </CardDescription>
            </div>
            <Button>新規物件登録</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>読み込み中...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">物件が見つかりませんでした</p>
              </div>
            ) : (
              <>
                {/* デスクトップ表示 */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>物件名</TableHead>
                        <TableHead>住所</TableHead>
                        <TableHead>戸数</TableHead>
                        <TableHead>CATV状況</TableHead>
                        <TableHead>営業状況</TableHead>
                        <TableHead>登録日</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow
                          key={property.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/properties/${property.id}`)}
                        >
                          <TableCell className="font-medium">
                            {property.property_name}
                          </TableCell>
                          <TableCell>
                            {property.prefecture} {property.city}
                          </TableCell>
                          <TableCell>
                            {property.total_units ? `${property.total_units}戸` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {catvStatusLabels[property.catv_status] || property.catv_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={salesStatusBadgeVariant[property.sales_status]}>
                              {salesStatusLabels[property.sales_status] || property.sales_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(property.created_at).toLocaleDateString('ja-JP')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* モバイル表示 */}
                <div className="md:hidden space-y-4">
                  {properties.map((property) => (
                    <Card
                      key={property.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/properties/${property.id}`)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{property.property_name}</CardTitle>
                            <CardDescription>
                              {property.prefecture} {property.city}
                            </CardDescription>
                          </div>
                          <Badge variant={salesStatusBadgeVariant[property.sales_status]}>
                            {salesStatusLabels[property.sales_status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          {property.total_units && (
                            <div className="flex justify-between">
                              <dt className="text-gray-500">戸数</dt>
                              <dd className="font-medium">{property.total_units}戸</dd>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <dt className="text-gray-500">CATV状況</dt>
                            <dd>
                              <Badge variant="secondary" className="text-xs">
                                {catvStatusLabels[property.catv_status]}
                              </Badge>
                            </dd>
                          </div>
                          {property.management_company_name && (
                            <div>
                              <dt className="text-gray-500">管理会社</dt>
                              <dd>{property.management_company_name}</dd>
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
