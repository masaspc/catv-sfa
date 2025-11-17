'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { dataImportApi, ImportResult } from '@/lib/data-import'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function DataImportPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [importType, setImportType] = useState<'customers' | 'deals'>('customers')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        alert('CSVファイルのみ選択できます')
        return
      }
      setSelectedFile(file)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      alert('ファイルを選択してください')
      return
    }

    try {
      setLoading(true)
      setResult(null)

      let importResult: ImportResult
      if (importType === 'customers') {
        importResult = await dataImportApi.importCustomers(selectedFile)
      } else {
        importResult = await dataImportApi.importDeals(selectedFile)
      }

      setResult(importResult)

      // ファイル選択をクリア
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('インポートエラー:', error)
      const errorMessage = error.response?.data?.detail || 'インポートに失敗しました'
      setResult({
        message: errorMessage,
        imported: 0,
        failed: 0,
        total: 0,
        errors: [errorMessage]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      let template
      if (importType === 'customers') {
        template = await dataImportApi.getCustomerTemplate()
      } else {
        template = await dataImportApi.getDealTemplate()
      }

      // CSVファイルとしてダウンロード
      const blob = new Blob([template.content], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', template.filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('テンプレートダウンロードエラー:', error)
      alert('テンプレートのダウンロードに失敗しました')
    }
  }

  // 管理者・マネージャー以外はアクセス不可
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>アクセス制限</CardTitle>
            <CardDescription>
              この機能は管理者・マネージャーのみ利用できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')}>
              ダッシュボードに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            データインポート
          </h1>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* インポート設定 */}
        <Card>
          <CardHeader>
            <CardTitle>CSVファイルインポート</CardTitle>
            <CardDescription>
              CSVファイルからデータを一括インポートします
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* インポートタイプ選択 */}
            <div className="space-y-2">
              <Label htmlFor="import-type">インポートデータ種別</Label>
              <Select value={importType} onValueChange={(value: any) => setImportType(value)}>
                <SelectTrigger id="import-type">
                  <SelectValue placeholder="種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customers">顧客データ</SelectItem>
                  <SelectItem value="deals">案件データ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* テンプレートダウンロード */}
            <div className="space-y-2">
              <Label>CSVテンプレート</Label>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full"
              >
                テンプレートをダウンロード
              </Button>
              <p className="text-xs text-gray-500">
                テンプレートをダウンロードして、データを入力後にアップロードしてください
              </p>
            </div>

            {/* ファイル選択 */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">CSVファイル</Label>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  選択: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* インポートボタン */}
            <Button
              onClick={handleImport}
              disabled={loading || !selectedFile}
              className="w-full"
            >
              {loading ? 'インポート中...' : 'インポートを実行'}
            </Button>
          </CardContent>
        </Card>

        {/* 結果表示 */}
        {result && (
          <Card className={result.failed > 0 ? 'border-yellow-500' : 'border-green-500'}>
            <CardHeader>
              <CardTitle className={result.failed > 0 ? 'text-yellow-700' : 'text-green-700'}>
                インポート結果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{result.total}</p>
                  <p className="text-sm text-gray-600">総件数</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                  <p className="text-sm text-gray-600">成功</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                  <p className="text-sm text-gray-600">失敗</p>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">エラー詳細:</p>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-60 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 使用方法 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">使用方法</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <ol className="list-decimal list-inside space-y-1">
              <li>インポートするデータの種別（顧客または案件）を選択します</li>
              <li>「テンプレートをダウンロード」ボタンでCSVテンプレートを取得します</li>
              <li>テンプレートにデータを入力し、CSVファイルとして保存します</li>
              <li>「CSVファイル」欄で作成したCSVファイルを選択します</li>
              <li>「インポートを実行」ボタンでインポートを開始します</li>
            </ol>
            <p className="mt-4 text-xs">
              注意: インポート中にエラーが発生した行はスキップされ、エラー詳細が表示されます。
              データの整合性を確認してから再度インポートしてください。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
