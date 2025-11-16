'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { propertiesApi, Property, PropertyCreate } from '@/lib/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const catvStatusOptions = [
  { value: 'not_available', label: '未対応' },
  { value: 'available', label: '対応済' },
  { value: 'in_construction', label: '工事中' },
  { value: 'under_consideration', label: '検討中' },
]

const salesStatusOptions = [
  { value: 'new_lead', label: '新規リード' },
  { value: 'contacted', label: '接触済' },
  { value: 'negotiating', label: '交渉中' },
  { value: 'contracted', label: '契約済' },
  { value: 'rejected', label: '失注' },
  { value: 'on_hold', label: '保留' },
]

export default function PropertyEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Property>>({
    property_name: '',
    catv_status: 'not_available',
    sales_status: 'new_lead',
  })

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
      const property = await propertiesApi.getProperty(parseInt(params.id))
      setFormData(property)
    } catch (error) {
      console.error('集合住宅情報の取得に失敗しました:', error)
      alert('集合住宅情報の取得に失敗しました')
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.property_name?.trim()) {
      alert('物件名は必須です')
      return
    }

    try {
      setSaving(true)
      await propertiesApi.updateProperty(parseInt(params.id), formData as PropertyCreate)
      alert('集合住宅情報を更新しました')
      router.push(`/properties/${params.id}`)
    } catch (error) {
      console.error('更新に失敗しました:', error)
      alert('集合住宅情報の更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Property, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || undefined,
    }))
  }

  if (!user || loading) {
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
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            集合住宅編集
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ID: {params.id}
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>集合住宅の基本的な情報を入力してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="property_name">物件名 <span className="text-red-500">*</span></Label>
                    <Input
                      id="property_name"
                      type="text"
                      required
                      value={formData.property_name || ''}
                      onChange={(e) => handleChange('property_name', e.target.value)}
                      placeholder="〇〇マンション"
                    />
                  </div>

                  <div>
                    <Label htmlFor="property_type">物件種別</Label>
                    <Input
                      id="property_type"
                      type="text"
                      value={formData.property_type || ''}
                      onChange={(e) => handleChange('property_type', e.target.value)}
                      placeholder="マンション"
                    />
                  </div>

                  <div>
                    <Label htmlFor="total_units">総戸数</Label>
                    <Input
                      id="total_units"
                      type="number"
                      value={formData.total_units || ''}
                      onChange={(e) => handleChange('total_units', parseInt(e.target.value) || undefined)}
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="floors">階数</Label>
                    <Input
                      id="floors"
                      type="number"
                      value={formData.floors || ''}
                      onChange={(e) => handleChange('floors', parseInt(e.target.value) || undefined)}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="built_year">築年</Label>
                    <Input
                      id="built_year"
                      type="number"
                      value={formData.built_year || ''}
                      onChange={(e) => handleChange('built_year', parseInt(e.target.value) || undefined)}
                      placeholder="2020"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 住所情報 */}
            <Card>
              <CardHeader>
                <CardTitle>住所</CardTitle>
                <CardDescription>物件の所在地</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="postal_code">郵便番号</Label>
                      <Input
                        id="postal_code"
                        type="text"
                        value={formData.postal_code || ''}
                        onChange={(e) => handleChange('postal_code', e.target.value)}
                        placeholder="135-0091"
                      />
                    </div>

                    <div>
                      <Label htmlFor="prefecture">都道府県</Label>
                      <Input
                        id="prefecture"
                        type="text"
                        value={formData.prefecture || ''}
                        onChange={(e) => handleChange('prefecture', e.target.value)}
                        placeholder="東京都"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">市区町村</Label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="港区"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address_line1">番地・建物名</Label>
                    <Input
                      id="address_line1"
                      type="text"
                      value={formData.address_line1 || ''}
                      onChange={(e) => handleChange('address_line1', e.target.value)}
                      placeholder="赤坂1-2-3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_line2">建物詳細</Label>
                    <Input
                      id="address_line2"
                      type="text"
                      value={formData.address_line2 || ''}
                      onChange={(e) => handleChange('address_line2', e.target.value)}
                      placeholder="追加情報"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CATV・営業ステータス */}
            <Card>
              <CardHeader>
                <CardTitle>CATV・営業ステータス</CardTitle>
                <CardDescription>サービス提供状況・営業状態</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="catv_status">CATV状態</Label>
                    <Select
                      value={formData.catv_status || 'not_available'}
                      onValueChange={(value) => handleChange('catv_status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {catvStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sales_status">営業ステータス</Label>
                    <Select
                      value={formData.sales_status || 'new_lead'}
                      onValueChange={(value) => handleChange('sales_status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {salesStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 管理情報 */}
            <Card>
              <CardHeader>
                <CardTitle>管理情報</CardTitle>
                <CardDescription>管理会社・管理形態</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="management_type">管理形態</Label>
                    <Input
                      id="management_type"
                      type="text"
                      value={formData.management_type || ''}
                      onChange={(e) => handleChange('management_type', e.target.value)}
                      placeholder="自主管理"
                    />
                  </div>

                  <div>
                    <Label htmlFor="management_company_name">管理会社名</Label>
                    <Input
                      id="management_company_name"
                      type="text"
                      value={formData.management_company_name || ''}
                      onChange={(e) => handleChange('management_company_name', e.target.value)}
                      placeholder="〇〇管理株式会社"
                    />
                  </div>

                  <div>
                    <Label htmlFor="management_contact_person">担当者名</Label>
                    <Input
                      id="management_contact_person"
                      type="text"
                      value={formData.management_contact_person || ''}
                      onChange={(e) => handleChange('management_contact_person', e.target.value)}
                      placeholder="山田太郎"
                    />
                  </div>

                  <div>
                    <Label htmlFor="management_phone">電話番号</Label>
                    <Input
                      id="management_phone"
                      type="tel"
                      value={formData.management_phone || ''}
                      onChange={(e) => handleChange('management_phone', e.target.value)}
                      placeholder="03-1234-5678"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="management_email">メールアドレス</Label>
                    <Input
                      id="management_email"
                      type="email"
                      value={formData.management_email || ''}
                      onChange={(e) => handleChange('management_email', e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* オーナー情報 */}
            <Card>
              <CardHeader>
                <CardTitle>オーナー情報</CardTitle>
                <CardDescription>物件オーナーの連絡先</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="owner_name">オーナー名</Label>
                    <Input
                      id="owner_name"
                      type="text"
                      value={formData.owner_name || ''}
                      onChange={(e) => handleChange('owner_name', e.target.value)}
                      placeholder="田中花子"
                    />
                  </div>

                  <div>
                    <Label htmlFor="owner_phone">電話番号</Label>
                    <Input
                      id="owner_phone"
                      type="tel"
                      value={formData.owner_phone || ''}
                      onChange={(e) => handleChange('owner_phone', e.target.value)}
                      placeholder="090-1234-5678"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="owner_email">メールアドレス</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={formData.owner_email || ''}
                      onChange={(e) => handleChange('owner_email', e.target.value)}
                      placeholder="owner@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 契約・料金情報 */}
            <Card>
              <CardHeader>
                <CardTitle>契約・料金情報</CardTitle>
                <CardDescription>一括契約・料金設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="bulk_contract_service">一括契約サービス</Label>
                    <Input
                      id="bulk_contract_service"
                      type="text"
                      value={formData.bulk_contract_service || ''}
                      onChange={(e) => handleChange('bulk_contract_service', e.target.value)}
                      placeholder="CATV基本サービス"
                    />
                  </div>

                  <div>
                    <Label htmlFor="facility_fee_monthly">月額施設利用料（円）</Label>
                    <Input
                      id="facility_fee_monthly"
                      type="number"
                      value={formData.facility_fee_monthly || ''}
                      onChange={(e) => handleChange('facility_fee_monthly', parseFloat(e.target.value) || undefined)}
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contract_start_date">契約開始日</Label>
                    <Input
                      id="contract_start_date"
                      type="date"
                      value={formData.contract_start_date || ''}
                      onChange={(e) => handleChange('contract_start_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="construction_date">工事予定日</Label>
                    <Input
                      id="construction_date"
                      type="date"
                      value={formData.construction_date || ''}
                      onChange={(e) => handleChange('construction_date', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* その他の情報 */}
            <Card>
              <CardHeader>
                <CardTitle>その他の情報</CardTitle>
                <CardDescription>競合情報・備考など</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="competitor_info">競合情報</Label>
                  <Textarea
                    id="competitor_info"
                    value={formData.competitor_info || ''}
                    onChange={(e) => handleChange('competitor_info', e.target.value)}
                    placeholder="他社の導入状況など"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">備考</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="その他の特記事項"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="latitude">緯度</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || undefined)}
                      placeholder="35.6762"
                    />
                  </div>

                  <div>
                    <Label htmlFor="longitude">経度</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || undefined)}
                      placeholder="139.6503"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/properties/${params.id}`)}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
