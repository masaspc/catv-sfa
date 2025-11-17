'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dealsApi, Deal, DealCreate } from '@/lib/deals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const dealTypeOptions = [
  { value: 'new_individual', label: '新規個人' },
  { value: 'new_corporate', label: '新規法人' },
  { value: 'new_property', label: '新規集合住宅' },
  { value: 'upsell', label: 'アップセル' },
  { value: 'retention', label: 'リテンション' },
]

export default function DealEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Deal>>({
    deal_name: '',
    deal_type: 'new_individual',
    probability: 50,
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
      loadDeal()
    }
  }, [user, params.id])

  const loadDeal = async () => {
    try {
      setLoading(true)
      const deal = await dealsApi.getDeal(parseInt(params.id))
      setFormData(deal)
    } catch (error) {
      console.error('案件情報の取得に失敗しました:', error)
      alert('案件情報の取得に失敗しました')
      router.push('/deals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.deal_name?.trim()) {
      alert('案件名は必須です')
      return
    }

    try {
      setSaving(true)
      await dealsApi.updateDeal(parseInt(params.id), formData as DealCreate)
      alert('案件情報を更新しました')
      router.push(`/deals/${params.id}`)
    } catch (error) {
      console.error('更新に失敗しました:', error)
      alert('案件情報の更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Deal, value: any) => {
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
            案件編集
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
                <CardDescription>案件の基本的な情報を入力してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deal_name">案件名 <span className="text-red-500">*</span></Label>
                  <Input
                    id="deal_name"
                    type="text"
                    required
                    value={formData.deal_name || ''}
                    onChange={(e) => handleChange('deal_name', e.target.value)}
                    placeholder="案件名を入力"
                  />
                </div>

                <div>
                  <Label htmlFor="deal_type">案件種別 <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.deal_type || 'new_individual'}
                    onValueChange={(value) => handleChange('deal_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dealTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phase">フェーズ</Label>
                  <Input
                    id="phase"
                    type="text"
                    value={formData.phase || ''}
                    onChange={(e) => handleChange('phase', e.target.value)}
                    placeholder="例: 初回接触、提案中、クロージング"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 金額・確度 */}
            <Card>
              <CardHeader>
                <CardTitle>金額・受注確度</CardTitle>
                <CardDescription>見積金額と受注の可能性</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="estimated_amount">見積金額（円）</Label>
                    <Input
                      id="estimated_amount"
                      type="number"
                      min="0"
                      value={formData.estimated_amount || ''}
                      onChange={(e) => handleChange('estimated_amount', parseInt(e.target.value) || undefined)}
                      placeholder="100000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="probability">受注確度（%）</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability ?? 50}
                      onChange={(e) => handleChange('probability', parseInt(e.target.value) || 50)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 日程 */}
            <Card>
              <CardHeader>
                <CardTitle>日程</CardTitle>
                <CardDescription>受注予定日・実績日</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="expected_close_date">受注予定日</Label>
                    <Input
                      id="expected_close_date"
                      type="date"
                      value={formData.expected_close_date?.split('T')[0] || ''}
                      onChange={(e) => handleChange('expected_close_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="actual_close_date">実際の受注日</Label>
                    <Input
                      id="actual_close_date"
                      type="date"
                      value={formData.actual_close_date?.split('T')[0] || ''}
                      onChange={(e) => handleChange('actual_close_date', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 関連情報 */}
            <Card>
              <CardHeader>
                <CardTitle>関連情報</CardTitle>
                <CardDescription>顧客・集合住宅との紐付け</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="customer_id">顧客ID</Label>
                    <Input
                      id="customer_id"
                      type="number"
                      min="0"
                      value={formData.customer_id || ''}
                      onChange={(e) => handleChange('customer_id', parseInt(e.target.value) || undefined)}
                      placeholder="顧客IDを入力"
                    />
                  </div>

                  <div>
                    <Label htmlFor="property_id">集合住宅ID</Label>
                    <Input
                      id="property_id"
                      type="number"
                      min="0"
                      value={formData.property_id || ''}
                      onChange={(e) => handleChange('property_id', parseInt(e.target.value) || undefined)}
                      placeholder="集合住宅IDを入力"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 失注理由 */}
            <Card>
              <CardHeader>
                <CardTitle>失注理由</CardTitle>
                <CardDescription>失注した場合の理由を記入</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="lost_reason"
                  value={formData.lost_reason || ''}
                  onChange={(e) => handleChange('lost_reason', e.target.value)}
                  placeholder="失注理由を記入してください"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/deals/${params.id}`)}
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
