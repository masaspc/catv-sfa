'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { contractsApi, Contract, ContractUpdate } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const serviceTypeOptions = [
  { value: 'terrestrial_only', label: '地上波のみ' },
  { value: 'with_bs_cs', label: 'BS・CS込み' },
  { value: 'with_internet', label: 'インターネット込み' },
  { value: 'with_phone', label: '電話込み' },
  { value: 'set_contract', label: 'セット契約' },
]

const paymentMethodOptions = [
  { value: 'credit_card', label: 'クレジットカード' },
  { value: 'bank_transfer', label: '銀行振込' },
  { value: 'direct_debit', label: '口座振替' },
  { value: 'convenience_store', label: 'コンビニ払い' },
]

export default function ContractEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ContractUpdate>({})

  useEffect(() => {
    checkAuth().then(() => {
      if (!user) {
        router.push('/login')
      }
    })
  }, [])

  useEffect(() => {
    if (user) {
      loadContract()
    }
  }, [user, params.id])

  const loadContract = async () => {
    try {
      setLoading(true)
      const data = await contractsApi.getContract(parseInt(params.id))
      setFormData({
        service_type: data.service_type,
        plan_name: data.plan_name,
        monthly_fee: data.monthly_fee,
        payment_method: data.payment_method,
        start_date: data.start_date,
        end_date: data.end_date,
        customer_id: data.customer_id,
        property_id: data.property_id,
        notes: data.notes,
      })
    } catch (error) {
      console.error('契約情報の取得に失敗しました:', error)
      alert('契約情報の取得に失敗しました')
      router.push('/contracts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      await contractsApi.updateContract(parseInt(params.id), formData)
      alert('契約を更新しました')
      router.push(`/contracts/${params.id}`)
    } catch (error) {
      console.error('更新に失敗しました:', error)
      alert('契約の更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof ContractUpdate, value: any) => {
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
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            契約編集
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
                  <Label htmlFor="service_type">サービス種別</Label>
                  <Select
                    value={formData.service_type || ''}
                    onValueChange={(value) => handleChange('service_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="plan_name">プラン名</Label>
                  <Input
                    id="plan_name"
                    type="text"
                    value={formData.plan_name || ''}
                    onChange={(e) => handleChange('plan_name', e.target.value)}
                    placeholder="例: 基本プラン"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="monthly_fee">月額料金（円）</Label>
                    <Input
                      id="monthly_fee"
                      type="number"
                      min="0"
                      value={formData.monthly_fee || ''}
                      onChange={(e) => handleChange('monthly_fee', parseInt(e.target.value) || undefined)}
                      placeholder="3000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_method">支払方法</Label>
                    <Select
                      value={formData.payment_method || ''}
                      onValueChange={(value) => handleChange('payment_method', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="start_date">契約開始日</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date?.split('T')[0] || ''}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">解約日</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date?.split('T')[0] || ''}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="customer_id">顧客ID</Label>
                    <Input
                      id="customer_id"
                      type="number"
                      min="0"
                      value={formData.customer_id || ''}
                      onChange={(e) => handleChange('customer_id', parseInt(e.target.value) || undefined)}
                      placeholder="顧客ID"
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
                      placeholder="集合住宅ID"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">備考</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="契約に関する備考"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/contracts/${params.id}`)}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? '更新中...' : '更新'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
