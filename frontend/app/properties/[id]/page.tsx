'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { propertiesApi, Property } from '@/lib/properties'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const catvStatusLabels: { [key: string]: string } = {
  not_available: '未対応',
  available: '対応済',
  in_construction: '工事中',
  under_consideration: '検討中',
}

const catvStatusBadgeVariant: { [key: string]: 'default' | 'success' | 'warning' | 'error' | 'secondary' } = {
  not_available: 'error',
  available: 'success',
  in_construction: 'warning',
  under_consideration: 'default',
}

const salesStatusLabels: { [key: string]: string } = {
  new_lead: '新規リード',
  contacted: '接触済',
  negotiating: '交渉中',
  contracted: '契約済',
  rejected: '失注',
  on_hold: '保留',
}

const salesStatusBadgeVariant: { [key: string]: 'default' | 'success' | 'warning' | 'error' | 'secondary' } = {
  new_lead: 'default',
  contacted: 'default',
  negotiating: 'warning',
  contracted: 'success',
  rejected: 'error',
  on_hold: 'secondary',
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [property, setProperty] = useState<Property | null>(null)
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
      loadProperty()
    }
  }, [user, params.id])

  const loadProperty = async () => {
    try {
      setLoading(true)
      const data = await propertiesApi.getProperty(parseInt(params.id))
      setProperty(data)
    } catch (error) {
      console.error('集合住宅詳細の取得に失敗しました:', error)
      alert('集合住宅情報の取得に失敗しました')
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの集合住宅を削除しますか？')) {
      return
    }

    try {
      await propertiesApi.deleteProperty(parseInt(params.id))
      alert('集合住宅を削除しました')
      router.push('/properties')
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

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>集合住宅が見つかりません</p>
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
              集合住宅詳細
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ID: {property.id}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/properties')}>
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
                  <CardDescription>集合住宅の基本的な情報</CardDescription>
                </div>
                <Button onClick={() => router.push(`/properties/${property.id}/edit`)}>
                  編集
                </Button>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">物件名</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property.property_name}</dd>
                  </div>
                  {property.property_type && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">物件種別</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.property_type}</dd>
                    </div>
                  )}
                  {property.total_units && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">総戸数</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.total_units}戸</dd>
                    </div>
                  )}
                  {property.floors && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">階数</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.floors}階建</dd>
                    </div>
                  )}
                  {property.built_year && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">築年</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.built_year}年</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 住所情報 */}
            <Card>
              <CardHeader>
                <CardTitle>住所</CardTitle>
                <CardDescription>物件の所在地</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  {property.postal_code && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">郵便番号</dt>
                      <dd className="mt-1 text-sm text-gray-900">〒{property.postal_code}</dd>
                    </div>
                  )}
                  {(property.prefecture || property.city || property.address_line1) && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">住所</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {property.prefecture} {property.city}
                        {property.address_line1 && <><br />{property.address_line1}</>}
                        {property.address_line2 && <><br />{property.address_line2}</>}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 管理情報 */}
            <Card>
              <CardHeader>
                <CardTitle>管理情報</CardTitle>
                <CardDescription>管理会社・管理形態</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {property.management_type && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">管理形態</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.management_type}</dd>
                    </div>
                  )}
                  {property.management_company_name && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">管理会社名</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.management_company_name}</dd>
                    </div>
                  )}
                  {property.management_contact_person && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">担当者名</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.management_contact_person}</dd>
                    </div>
                  )}
                  {property.management_phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">電話番号</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`tel:${property.management_phone}`} className="text-blue-600 hover:underline">
                          {property.management_phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {property.management_email && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`mailto:${property.management_email}`} className="text-blue-600 hover:underline">
                          {property.management_email}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* オーナー情報 */}
            {(property.owner_name || property.owner_phone || property.owner_email) && (
              <Card>
                <CardHeader>
                  <CardTitle>オーナー情報</CardTitle>
                  <CardDescription>物件オーナーの連絡先</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {property.owner_name && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">オーナー名</dt>
                        <dd className="mt-1 text-sm text-gray-900">{property.owner_name}</dd>
                      </div>
                    )}
                    {property.owner_phone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">電話番号</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <a href={`tel:${property.owner_phone}`} className="text-blue-600 hover:underline">
                            {property.owner_phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {property.owner_email && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <a href={`mailto:${property.owner_email}`} className="text-blue-600 hover:underline">
                            {property.owner_email}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* CATV・契約情報 */}
            <Card>
              <CardHeader>
                <CardTitle>CATV・契約情報</CardTitle>
                <CardDescription>サービス提供状況</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CATV状態</dt>
                    <dd className="mt-1">
                      <Badge variant={catvStatusBadgeVariant[property.catv_status]}>
                        {catvStatusLabels[property.catv_status] || property.catv_status}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">営業ステータス</dt>
                    <dd className="mt-1">
                      <Badge variant={salesStatusBadgeVariant[property.sales_status]}>
                        {salesStatusLabels[property.sales_status] || property.sales_status}
                      </Badge>
                    </dd>
                  </div>
                  {property.bulk_contract_service && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">一括契約サービス</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.bulk_contract_service}</dd>
                    </div>
                  )}
                  {property.facility_fee_monthly && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">月額施設利用料</dt>
                      <dd className="mt-1 text-sm text-gray-900">¥{property.facility_fee_monthly.toLocaleString()}</dd>
                    </div>
                  )}
                  {property.contract_start_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">契約開始日</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(property.contract_start_date).toLocaleDateString('ja-JP')}
                      </dd>
                    </div>
                  )}
                  {property.construction_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">工事予定日</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(property.construction_date).toLocaleDateString('ja-JP')}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* その他の情報 */}
            {(property.competitor_info || property.notes) && (
              <Card>
                <CardHeader>
                  <CardTitle>その他の情報</CardTitle>
                  <CardDescription>競合情報・備考</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    {property.competitor_info && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">競合情報</dt>
                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{property.competitor_info}</dd>
                      </div>
                    )}
                    {property.notes && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">備考</dt>
                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{property.notes}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
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
                    集合住宅を削除
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
                      {new Date(property.created_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                  {property.updated_at && (
                    <div>
                      <dt className="text-gray-500">最終更新</dt>
                      <dd className="text-gray-900">
                        {new Date(property.updated_at).toLocaleString('ja-JP')}
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
