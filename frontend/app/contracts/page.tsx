'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { contractsApi, Contract } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const serviceTypeLabels: { [key: string]: string } = {
  terrestrial_only: '地上波のみ',
  with_bs_cs: 'BS・CS込み',
  with_internet: 'インターネット込み',
  with_phone: '電話込み',
  set_contract: 'セット契約',
}

const paymentMethodLabels: { [key: string]: string } = {
  credit_card: 'クレジットカード',
  bank_transfer: '銀行振込',
  direct_debit: '口座振替',
  convenience_store: 'コンビニ払い',
}

export default function ContractsPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  useEffect(() => {
    checkAuth().then(() => {
      if (!user) {
        router.push('/login')
      }
    })
  }, [])

  useEffect(() => {
    if (user) {
      loadContracts()
    }
  }, [user, showActiveOnly])

  const loadContracts = async () => {
    try {
      setLoading(true)
      const data = showActiveOnly
        ? await contractsApi.getActiveContracts(0, 100)
        : await contractsApi.getContracts(0, 100)
      setContracts(data)
    } catch (error) {
      console.error('契約一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadContracts()
      return
    }

    try {
      setLoading(true)
      const data = await contractsApi.searchContracts(searchQuery)
      setContracts(data)
    } catch (error) {
      console.error('検索に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      await contractsApi.exportToCSV()
    } catch (error) {
      console.error('CSVエクスポートに失敗しました:', error)
      alert('CSVエクスポートに失敗しました')
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
              契約管理
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              全{contracts.length}件の契約
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
            <CardTitle>契約検索</CardTitle>
            <CardDescription>
              プラン名で検索できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Input
                placeholder="検索キーワードを入力..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>検索</Button>
              <Button variant="outline" onClick={loadContracts}>
                リセット
              </Button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeOnly"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="activeOnly" className="text-sm">
                  有効のみ
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 契約一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>契約一覧</CardTitle>
              <CardDescription>
                クリックして詳細を表示
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                CSVエクスポート
              </Button>
              <Button onClick={() => router.push('/contracts/new')}>新規契約登録</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>読み込み中...</p>
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">契約が見つかりませんでした</p>
              </div>
            ) : (
              <>
                {/* デスクトップ表示 */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>プラン名</TableHead>
                        <TableHead>サービス種別</TableHead>
                        <TableHead>月額料金</TableHead>
                        <TableHead>契約開始日</TableHead>
                        <TableHead>支払方法</TableHead>
                        <TableHead>ステータス</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract) => (
                        <TableRow
                          key={contract.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/contracts/${contract.id}`)}
                        >
                          <TableCell className="font-medium">
                            {contract.plan_name || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {serviceTypeLabels[contract.service_type] || contract.service_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {contract.monthly_fee ? `¥${contract.monthly_fee.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>
                            {contract.start_date
                              ? new Date(contract.start_date).toLocaleDateString('ja-JP')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {contract.payment_method
                              ? paymentMethodLabels[contract.payment_method]
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {contract.end_date ? (
                              <Badge variant="error">解約済</Badge>
                            ) : (
                              <Badge variant="success">有効</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* モバイル表示 */}
                <div className="md:hidden space-y-4">
                  {contracts.map((contract) => (
                    <Card
                      key={contract.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/contracts/${contract.id}`)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {contract.plan_name || 'プラン名未設定'}
                            </CardTitle>
                            <CardDescription>
                              {serviceTypeLabels[contract.service_type]}
                            </CardDescription>
                          </div>
                          {contract.end_date ? (
                            <Badge variant="error">解約済</Badge>
                          ) : (
                            <Badge variant="success">有効</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          {contract.monthly_fee && (
                            <div>
                              <dt className="text-gray-500">月額料金</dt>
                              <dd>¥{contract.monthly_fee.toLocaleString()}</dd>
                            </div>
                          )}
                          {contract.start_date && (
                            <div>
                              <dt className="text-gray-500">契約開始日</dt>
                              <dd>{new Date(contract.start_date).toLocaleDateString('ja-JP')}</dd>
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
