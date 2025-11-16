'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { customersApi, Customer } from '@/lib/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const customerTypeLabels: { [key: string]: string } = {
  prospect: '見込客',
  contracted: '契約者',
  canceled: '解約者',
  dormant: '休眠顧客',
}

const customerTypeBadgeVariant: { [key: string]: 'default' | 'success' | 'warning' | 'error' | 'secondary' } = {
  prospect: 'default',
  contracted: 'success',
  canceled: 'error',
  dormant: 'secondary',
}

export default function CustomersPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [customers, setCustomers] = useState<Customer[]>([])
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
      loadCustomers()
    }
  }, [user])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await customersApi.getCustomers(0, 100)
      setCustomers(data.items)
      setTotal(data.total)
    } catch (error) {
      console.error('顧客一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadCustomers()
      return
    }

    try {
      setLoading(true)
      const data = await customersApi.searchCustomers(searchQuery)
      setCustomers(data)
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
              顧客管理
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              全{total}件の顧客
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
            <CardTitle>顧客検索</CardTitle>
            <CardDescription>
              名前、電話番号、メールアドレスで検索できます
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
              <Button variant="outline" onClick={loadCustomers}>
                リセット
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 顧客一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>顧客一覧</CardTitle>
              <CardDescription>
                クリックして詳細を表示
              </CardDescription>
            </div>
            <Button>新規顧客登録</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>読み込み中...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">顧客が見つかりませんでした</p>
              </div>
            ) : (
              <>
                {/* デスクトップ表示 */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>顧客名</TableHead>
                        <TableHead>電話番号</TableHead>
                        <TableHead>メール</TableHead>
                        <TableHead>住所</TableHead>
                        <TableHead>区分</TableHead>
                        <TableHead>登録日</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow
                          key={customer.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/customers/${customer.id}`)}
                        >
                          <TableCell className="font-medium">
                            {customer.name}
                            {customer.name_kana && (
                              <div className="text-xs text-gray-500">
                                {customer.name_kana}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{customer.phone_primary || '-'}</TableCell>
                          <TableCell>{customer.email || '-'}</TableCell>
                          <TableCell>
                            {customer.city || customer.prefecture || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={customerTypeBadgeVariant[customer.customer_type]}>
                              {customerTypeLabels[customer.customer_type] || customer.customer_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(customer.created_at).toLocaleDateString('ja-JP')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* モバイル表示 */}
                <div className="md:hidden space-y-4">
                  {customers.map((customer) => (
                    <Card
                      key={customer.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{customer.name}</CardTitle>
                            {customer.name_kana && (
                              <CardDescription>{customer.name_kana}</CardDescription>
                            )}
                          </div>
                          <Badge variant={customerTypeBadgeVariant[customer.customer_type]}>
                            {customerTypeLabels[customer.customer_type]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          {customer.phone_primary && (
                            <div>
                              <dt className="text-gray-500">電話番号</dt>
                              <dd>{customer.phone_primary}</dd>
                            </div>
                          )}
                          {customer.email && (
                            <div>
                              <dt className="text-gray-500">メール</dt>
                              <dd className="truncate">{customer.email}</dd>
                            </div>
                          )}
                          {(customer.city || customer.prefecture) && (
                            <div>
                              <dt className="text-gray-500">住所</dt>
                              <dd>{customer.prefecture} {customer.city}</dd>
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
