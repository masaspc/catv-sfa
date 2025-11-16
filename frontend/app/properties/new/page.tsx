'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { propertiesApi, PropertyCreate } from '@/lib/properties'
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

export default function PropertyNewPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<PropertyCreate>>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.property_name?.trim()) {
      alert('物件名は必須です')
      return
    }

    try {
      setSaving(true)
      const newProperty = await propertiesApi.createProperty(formData as PropertyCreate)
      alert('集合住宅を登録しました')
      router.push(`/properties/${newProperty.id}`)
    } catch (error) {
      console.error('登録に失敗しました:', error)
      alert('集合住宅の登録に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof PropertyCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || undefined,
    }))
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
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            新規集合住宅登録
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            新しい集合住宅情報を入力してください
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
                <CardDescription>管理会社・管理形態（任意）</CardDescription>
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
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/properties')}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? '登録中...' : '登録'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
