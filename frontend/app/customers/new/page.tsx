'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { customersApi, CustomerCreate } from '@/lib/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const customerTypeOptions = [
  { value: 'prospect', label: '見込客' },
  { value: 'contracted', label: '契約者' },
  { value: 'canceled', label: '解約者' },
  { value: 'dormant', label: '休眠顧客' },
]

export default function CustomerNewPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CustomerCreate>({
    name: '',
    customer_type: 'prospect',
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

    if (!formData.name.trim()) {
      alert('顧客名は必須です')
      return
    }

    try {
      setSaving(true)
      const newCustomer = await customersApi.createCustomer(formData)
      alert('顧客を登録しました')
      router.push(`/customers/${newCustomer.id}`)
    } catch (error) {
      console.error('登録に失敗しました:', error)
      alert('顧客の登録に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof CustomerCreate, value: any) => {
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
            新規顧客登録
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            新しい顧客情報を入力してください
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
                <CardDescription>顧客の基本的な情報を入力してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">顧客名 <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="山田太郎"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="name_kana">フリガナ</Label>
                    <Input
                      id="name_kana"
                      type="text"
                      value={formData.name_kana || ''}
                      onChange={(e) => handleChange('name_kana', e.target.value)}
                      placeholder="ヤマダタロウ"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer_type">顧客区分 <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.customer_type}
                      onValueChange={(value) => handleChange('customer_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {customerTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="birth_date">生年月日</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date || ''}
                      onChange={(e) => handleChange('birth_date', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 連絡先情報 */}
            <Card>
              <CardHeader>
                <CardTitle>連絡先</CardTitle>
                <CardDescription>電話番号・メールアドレス</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone_primary">電話番号（メイン）</Label>
                    <Input
                      id="phone_primary"
                      type="tel"
                      value={formData.phone_primary || ''}
                      onChange={(e) => handleChange('phone_primary', e.target.value)}
                      placeholder="03-1234-5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone_secondary">電話番号（サブ）</Label>
                    <Input
                      id="phone_secondary"
                      type="tel"
                      value={formData.phone_secondary || ''}
                      onChange={(e) => handleChange('phone_secondary', e.target.value)}
                      placeholder="090-1234-5678"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="example@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 住所情報 */}
            <Card>
              <CardHeader>
                <CardTitle>住所</CardTitle>
                <CardDescription>お客様の住所情報</CardDescription>
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
                    <Label htmlFor="address_line2">部屋番号など</Label>
                    <Input
                      id="address_line2"
                      type="text"
                      value={formData.address_line2 || ''}
                      onChange={(e) => handleChange('address_line2', e.target.value)}
                      placeholder="101号室"
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
                onClick={() => router.push('/customers')}
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
