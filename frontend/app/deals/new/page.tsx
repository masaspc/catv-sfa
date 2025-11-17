'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dealsApi, DealCreate } from '@/lib/deals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const dealTypeOptions = [
  { value: 'new_individual', label: '新規個人' },
  { value: 'new_corporate', label: '新規法人' },
  { value: 'new_property', label: '新規集合住宅' },
  { value: 'upsell', label: 'アップセル' },
  { value: 'retention', label: 'リテンション' },
]

export default function DealNewPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<DealCreate>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.deal_name?.trim()) {
      alert('案件名は必須です')
      return
    }

    try {
      setSaving(true)
      const newDeal = await dealsApi.createDeal(formData)
      alert('案件を登録しました')
      router.push(`/deals/${newDeal.id}`)
    } catch (error) {
      console.error('登録に失敗しました:', error)
      alert('案件の登録に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof DealCreate, value: any) => {
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
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            新規案件登録
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deal_name">案件名 <span className="text-red-500">*</span></Label>
                  <Input
                    id="deal_name"
                    type="text"
                    required
                    value={formData.deal_name}
                    onChange={(e) => handleChange('deal_name', e.target.value)}
                    placeholder="案件名を入力"
                  />
                </div>

                <div>
                  <Label htmlFor="deal_type">案件種別 <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.deal_type}
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
                      value={formData.probability || 50}
                      onChange={(e) => handleChange('probability', parseInt(e.target.value) || 50)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phase">フェーズ</Label>
                  <Input
                    id="phase"
                    type="text"
                    value={formData.phase || ''}
                    onChange={(e) => handleChange('phase', e.target.value)}
                    placeholder="例: 初回接触"
                  />
                </div>

                <div>
                  <Label htmlFor="expected_close_date">受注予定日</Label>
                  <Input
                    id="expected_close_date"
                    type="date"
                    value={formData.expected_close_date?.split('T')[0] || ''}
                    onChange={(e) => handleChange('expected_close_date', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/deals')}
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
