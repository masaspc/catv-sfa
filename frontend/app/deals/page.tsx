'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dealsApi, Deal } from '@/lib/deals'
import { bulkOperationsApi } from '@/lib/bulk-operations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const dealTypeLabels: { [key: string]: string } = {
  new_individual: '新規個人',
  new_corporate: '新規法人',
  new_property: '新規集合住宅',
  upsell: 'アップセル',
  retention: 'リテンション',
}

const phaseLabels: { [key: string]: string } = {
  prospecting: '見込み客発掘',
  qualification: '資格確認',
  proposal: '提案',
  negotiation: '交渉',
  closing: 'クロージング',
  won: '受注',
  lost: '失注',
}

export default function DealsPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [allDeals, setAllDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // フィルタ状態
  const [selectedPhase, setSelectedPhase] = useState<string>('all')
  const [selectedDealType, setSelectedDealType] = useState<string>('all')
  const [minProbability, setMinProbability] = useState<string>('')
  const [maxProbability, setMaxProbability] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // 一括操作状態
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkPhase, setBulkPhase] = useState<string>('')
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    checkAuth().then(() => {
      if (!user) {
        router.push('/login')
      }
    })
  }, [])

  useEffect(() => {
    if (user) {
      loadDeals()
    }
  }, [user])

  const loadDeals = async () => {
    try {
      setLoading(true)
      const data = await dealsApi.getDeals(0, 100)
      setAllDeals(data)
    } catch (error) {
      console.error('案件一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルタリングされた案件リスト
  const filteredDeals = useMemo(() => {
    return allDeals.filter((deal) => {
      // 検索クエリフィルタ
      if (searchQuery.trim() && !deal.deal_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // フェーズフィルタ
      if (selectedPhase !== 'all' && deal.phase !== selectedPhase) {
        return false
      }

      // 案件種別フィルタ
      if (selectedDealType !== 'all' && deal.deal_type !== selectedDealType) {
        return false
      }

      // 受注確度フィルタ
      if (minProbability && deal.probability !== undefined && deal.probability < parseInt(minProbability)) {
        return false
      }
      if (maxProbability && deal.probability !== undefined && deal.probability > parseInt(maxProbability)) {
        return false
      }

      // 日付範囲フィルタ
      if (startDate && deal.expected_close_date) {
        const dealDate = new Date(deal.expected_close_date)
        if (dealDate < new Date(startDate)) {
          return false
        }
      }
      if (endDate && deal.expected_close_date) {
        const dealDate = new Date(deal.expected_close_date)
        if (dealDate > new Date(endDate)) {
          return false
        }
      }

      return true
    })
  }, [allDeals, searchQuery, selectedPhase, selectedDealType, minProbability, maxProbability, startDate, endDate])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedPhase('all')
    setSelectedDealType('all')
    setMinProbability('')
    setMaxProbability('')
    setStartDate('')
    setEndDate('')
  }

  const handleExportCSV = async () => {
    try {
      await dealsApi.exportToCSV()
    } catch (error) {
      console.error('CSVエクスポートに失敗しました:', error)
      alert('CSVエクスポートに失敗しました')
    }
  }

  // 一括操作ハンドラー
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredDeals.map(deal => deal.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('削除する案件を選択してください')
      return
    }

    if (!confirm(`選択した${selectedIds.length}件の案件を削除しますか？`)) {
      return
    }

    try {
      const result = await bulkOperationsApi.deleteDeals(selectedIds)
      alert(`削除完了: 成功${result.processed}件、失敗${result.failed}件`)
      setSelectedIds([])
      loadDeals()
    } catch (error) {
      console.error('一括削除エラー:', error)
      alert('一括削除に失敗しました')
    }
  }

  const handleBulkUpdatePhase = async () => {
    if (selectedIds.length === 0) {
      alert('更新する案件を選択してください')
      return
    }

    if (!bulkPhase) {
      alert('変更後のフェーズを選択してください')
      return
    }

    try {
      const result = await bulkOperationsApi.updateDeals({
        ids: selectedIds,
        phase: bulkPhase
      })
      alert(`更新完了: 成功${result.processed}件、失敗${result.failed}件`)
      setSelectedIds([])
      setBulkPhase('')
      loadDeals()
    } catch (error) {
      console.error('一括更新エラー:', error)
      alert('一括更新に失敗しました')
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
              案件管理
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              全{allDeals.length}件中 {filteredDeals.length}件表示
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 検索・フィルタバー */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>案件検索・フィルタ</CardTitle>
                <CardDescription>
                  案件名で検索し、条件でフィルタできます
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? '詳細フィルタを隠す' : '詳細フィルタを表示'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 検索バー */}
            <div className="flex gap-4">
              <Input
                placeholder="案件名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleResetFilters}>
                すべてクリア
              </Button>
            </div>

            {/* 詳細フィルタ */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                {/* フェーズフィルタ */}
                <div>
                  <Label htmlFor="phase-filter">フェーズ</Label>
                  <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                    <SelectTrigger id="phase-filter">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {Object.entries(phaseLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 案件種別フィルタ */}
                <div>
                  <Label htmlFor="deal-type-filter">案件種別</Label>
                  <Select value={selectedDealType} onValueChange={setSelectedDealType}>
                    <SelectTrigger id="deal-type-filter">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {Object.entries(dealTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 受注確度範囲 */}
                <div className="md:col-span-2 lg:col-span-1">
                  <Label>受注確度（%）</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="最小"
                      value={minProbability}
                      onChange={(e) => setMinProbability(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-gray-500">〜</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="最大"
                      value={maxProbability}
                      onChange={(e) => setMaxProbability(e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* 受注予定日範囲 */}
                <div className="md:col-span-2">
                  <Label>受注予定日範囲</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="text-gray-500">〜</span>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 案件一覧 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>案件一覧</CardTitle>
              <CardDescription>
                {selectedIds.length > 0 ? `${selectedIds.length}件選択中` : 'クリックして詳細を表示'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBulkActions(!showBulkActions)}
                disabled={filteredDeals.length === 0}
              >
                {showBulkActions ? '一括操作を閉じる' : '一括操作'}
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                CSVエクスポート
              </Button>
              <Button onClick={() => router.push('/deals/new')}>新規案件登録</Button>
            </div>
          </CardHeader>

          {/* 一括操作バー */}
          {showBulkActions && (
            <div className="px-6 py-4 bg-gray-50 border-t border-b">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="bulk-phase">フェーズ一括変更</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={bulkPhase} onValueChange={setBulkPhase}>
                      <SelectTrigger id="bulk-phase" className="w-48">
                        <SelectValue placeholder="フェーズ選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(phaseLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleBulkUpdatePhase}
                      disabled={selectedIds.length === 0 || !bulkPhase}
                    >
                      変更適用
                    </Button>
                  </div>
                </div>
                <div>
                  <Button
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={selectedIds.length === 0}
                  >
                    選択を削除 ({selectedIds.length})
                  </Button>
                </div>
              </div>
            </div>
          )}

          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>読み込み中...</p>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {allDeals.length === 0 ? '案件が見つかりませんでした' : '条件に一致する案件がありません'}
                </p>
              </div>
            ) : (
              <>
                {/* デスクトップ表示 */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {showBulkActions && (
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedIds.length === filteredDeals.length && filteredDeals.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                        )}
                        <TableHead>案件名</TableHead>
                        <TableHead>案件種別</TableHead>
                        <TableHead>フェーズ</TableHead>
                        <TableHead>見積金額</TableHead>
                        <TableHead>受注確度</TableHead>
                        <TableHead>受注予定日</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeals.map((deal) => (
                        <TableRow
                          key={deal.id}
                          className={showBulkActions ? '' : 'cursor-pointer'}
                          onClick={showBulkActions ? undefined : () => router.push(`/deals/${deal.id}`)}
                        >
                          {showBulkActions && (
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedIds.includes(deal.id)}
                                onCheckedChange={(checked) => handleSelectOne(deal.id, checked as boolean)}
                              />
                            </TableCell>
                          )}
                          <TableCell className="font-medium">{deal.deal_name}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {dealTypeLabels[deal.deal_type] || deal.deal_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{deal.phase || '-'}</TableCell>
                          <TableCell>
                            {deal.estimated_amount ? `¥${deal.estimated_amount.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>{deal.probability ? `${deal.probability}%` : '-'}</TableCell>
                          <TableCell>
                            {deal.expected_close_date
                              ? new Date(deal.expected_close_date).toLocaleDateString('ja-JP')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* モバイル表示 */}
                <div className="md:hidden space-y-4">
                  {filteredDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      className={showBulkActions ? '' : 'cursor-pointer hover:bg-gray-50'}
                      onClick={showBulkActions ? undefined : () => router.push(`/deals/${deal.id}`)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1">
                            {showBulkActions && (
                              <Checkbox
                                checked={selectedIds.includes(deal.id)}
                                onCheckedChange={(checked) => handleSelectOne(deal.id, checked as boolean)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <div>
                              <CardTitle className="text-lg">{deal.deal_name}</CardTitle>
                              <CardDescription>{deal.phase || 'フェーズ未設定'}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="default">
                            {dealTypeLabels[deal.deal_type]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          {deal.estimated_amount && (
                            <div>
                              <dt className="text-gray-500">見積金額</dt>
                              <dd>¥{deal.estimated_amount.toLocaleString()}</dd>
                            </div>
                          )}
                          {deal.probability && (
                            <div>
                              <dt className="text-gray-500">受注確度</dt>
                              <dd>{deal.probability}%</dd>
                            </div>
                          )}
                          {deal.expected_close_date && (
                            <div>
                              <dt className="text-gray-500">受注予定日</dt>
                              <dd>{new Date(deal.expected_close_date).toLocaleDateString('ja-JP')}</dd>
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
