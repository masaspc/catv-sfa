'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { contractsApi, Contract } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [contract, setContract] = useState<Contract | null>(null)
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
      loadContract()
    }
  }, [user, params.id])

  const loadContract = async () => {
    try {
      setLoading(true)
      const data = await contractsApi.getContract(parseInt(params.id))
      setContract(data)
    } catch (error) {
      console.error('契約詳細の取得に失敗しました:', error)
      alert('契約情報の取得に失敗しました')
      router.push('/contracts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('この契約を削除してもよろしいですか？')) {
      return
    }

    try {
      await contractsApi.deleteContract(parseInt(params.id))
      alert('契約を削除しました')
      router.push('/contracts')
    } catch (error) {
      console.error('削除に失敗しました:', error)
      alert('契約の削除に失敗しました')
    }
  }

  const serviceTypeLabels: Record<string, string> = {
    terrestrial_only: '地上波のみ',
    with_bs_cs: 'BS・CS込み',
    with_internet: 'インターネット込み',
    with_phone: '電話込み',
    set_contract: 'セット契約',
  }

  const paymentMethodLabels: Record<string, string> = {
    credit_card: 'クレジットカード',
    bank_transfer: '銀行振込',
    direct_debit: '口座振替',
    convenience_store: 'コンビニ払い',
  }

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>契約が見つかりません</p>
      </div>
    )
  }

  const isActive = !contract.end_date

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              契約詳細
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ID: {contract.id}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/contracts')}>
            一覧に戻る
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>契約の基本情報</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => router.push(`/contracts/${contract.id}/edit`)}>
                  編集
                </Button>
                {user.role === 'admin' && (
                  <Button variant="destructive" onClick={handleDelete}>
                    削除
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">サービス種別</dt>
                  <dd className="mt-1">
                    <Badge variant="outline">
                      {serviceTypeLabels[contract.service_type] || contract.service_type}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                  <dd className="mt-1">
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? '有効' : '解約済み'}
                    </Badge>
                  </dd>
                </div>
                {contract.plan_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">プラン名</dt>
                    <dd className="mt-1 text-sm text-gray-900">{contract.plan_name}</dd>
                  </div>
                )}
                {contract.monthly_fee !== undefined && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">月額料金</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {contract.monthly_fee.toLocaleString()}円
                    </dd>
                  </div>
                )}
                {contract.payment_method && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">支払方法</dt>
                    <dd className="mt-1">
                      <Badge variant="outline">
                        {paymentMethodLabels[contract.payment_method] || contract.payment_method}
                      </Badge>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* 契約期間 */}
          <Card>
            <CardHeader>
              <CardTitle>契約期間</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {contract.start_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">契約開始日</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(contract.start_date).toLocaleDateString('ja-JP')}
                    </dd>
                  </div>
                )}
                {contract.end_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">解約日</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(contract.end_date).toLocaleDateString('ja-JP')}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* 関連情報 */}
          <Card>
            <CardHeader>
              <CardTitle>関連情報</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {contract.customer_id && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">顧客ID</dt>
                    <dd className="mt-1 text-sm">
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => router.push(`/customers/${contract.customer_id}`)}
                      >
                        {contract.customer_id}
                      </Button>
                    </dd>
                  </div>
                )}
                {contract.property_id && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">集合住宅ID</dt>
                    <dd className="mt-1 text-sm">
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => router.push(`/properties/${contract.property_id}`)}
                      >
                        {contract.property_id}
                      </Button>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* 備考 */}
          {contract.notes && (
            <Card>
              <CardHeader>
                <CardTitle>備考</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-gray-900">{contract.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* メタ情報 */}
          <Card>
            <CardHeader>
              <CardTitle>メタ情報</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {contract.created_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">作成日時</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(contract.created_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                )}
                {contract.updated_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">更新日時</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(contract.updated_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
