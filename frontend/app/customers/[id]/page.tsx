'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { customersApi, Customer } from '@/lib/customers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [customer, setCustomer] = useState<Customer | null>(null)
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
      loadCustomer()
    }
  }, [user, params.id])

  const loadCustomer = async () => {
    try {
      setLoading(true)
      const data = await customersApi.getCustomer(parseInt(params.id))
      setCustomer(data)
    } catch (error) {
      console.error('顧客詳細の取得に失敗しました:', error)
      alert('顧客情報の取得に失敗しました')
      router.push('/customers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの顧客を削除しますか？')) {
      return
    }

    try {
      await customersApi.deleteCustomer(parseInt(params.id))
      alert('顧客を削除しました')
      router.push('/customers')
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

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>顧客が見つかりません</p>
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
              顧客詳細
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ID: {customer.id}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/customers')}>
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
                  <CardDescription>顧客の基本的な情報</CardDescription>
                </div>
                <Button onClick={() => router.push(`/customers/${customer.id}/edit`)}>
                  編集
                </Button>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">顧客名</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customer.name}</dd>
                  </div>
                  {customer.name_kana && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">フリガナ</dt>
                      <dd className="mt-1 text-sm text-gray-900">{customer.name_kana}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">区分</dt>
                    <dd className="mt-1">
                      <Badge variant={customerTypeBadgeVariant[customer.customer_type]}>
                        {customerTypeLabels[customer.customer_type]}
                      </Badge>
                    </dd>
                  </div>
                  {customer.birth_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">生年月日</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(customer.birth_date).toLocaleDateString('ja-JP')}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 連絡先情報 */}
            <Card>
              <CardHeader>
                <CardTitle>連絡先</CardTitle>
                <CardDescription>電話番号・メールアドレス</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {customer.phone_primary && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">電話番号（メイン）</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`tel:${customer.phone_primary}`} className="text-blue-600 hover:underline">
                          {customer.phone_primary}
                        </a>
                      </dd>
                    </div>
                  )}
                  {customer.phone_secondary && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">電話番号（サブ）</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`tel:${customer.phone_secondary}`} className="text-blue-600 hover:underline">
                          {customer.phone_secondary}
                        </a>
                      </dd>
                    </div>
                  )}
                  {customer.email && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                          {customer.email}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 住所情報 */}
            <Card>
              <CardHeader>
                <CardTitle>住所</CardTitle>
                <CardDescription>お客様の住所情報</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  {customer.postal_code && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">郵便番号</dt>
                      <dd className="mt-1 text-sm text-gray-900">〒{customer.postal_code}</dd>
                    </div>
                  )}
                  {(customer.prefecture || customer.city || customer.address_line1) && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">住所</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.prefecture} {customer.city}
                        {customer.address_line1 && <><br />{customer.address_line1}</>}
                        {customer.address_line2 && <><br />{customer.address_line2}</>}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* 右カラム - アクション・履歴 */}
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
                  案件を作成
                </Button>
                <Button className="w-full" variant="outline">
                  契約情報を表示
                </Button>
                {user.role === 'admin' && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleDelete}
                  >
                    顧客を削除
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
                      {new Date(customer.created_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                  {customer.updated_at && (
                    <div>
                      <dt className="text-gray-500">最終更新</dt>
                      <dd className="text-gray-900">
                        {new Date(customer.updated_at).toLocaleString('ja-JP')}
                      </dd>
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
