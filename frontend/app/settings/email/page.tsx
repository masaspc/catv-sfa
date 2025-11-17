'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { emailApi, EmailTest } from '@/lib/email'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function EmailSettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  // テストメール用
  const [testEmail, setTestEmail] = useState<EmailTest>({
    to_email: '',
    subject: 'テストメール',
    message: 'これはテストメールです。',
  })

  const handleSendTestEmail = async () => {
    try {
      setLoading(true)
      setResult('')
      const response = await emailApi.sendTestEmail(testEmail)
      setResult(`✓ ${response.message}`)
    } catch (error) {
      console.error('テストメール送信エラー:', error)
      setResult(`✗ テストメールの送信に失敗しました`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendDealDeadlineNotifications = async () => {
    try {
      setLoading(true)
      setResult('')
      const response = await emailApi.sendDealDeadlineNotifications()
      setResult(`✓ ${response.message} (対象: ${response.total_deals}件)`)
    } catch (error) {
      console.error('案件期限通知エラー:', error)
      setResult(`✗ 案件期限通知の送信に失敗しました`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendActivityFollowUpNotifications = async () => {
    try {
      setLoading(true)
      setResult('')
      const response = await emailApi.sendActivityFollowUpNotifications()
      setResult(`✓ ${response.message} (対象: ${response.total_activities}件)`)
    } catch (error) {
      console.error('活動フォローアップ通知エラー:', error)
      setResult(`✗ 活動フォローアップ通知の送信に失敗しました`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendDailyReportReminders = async () => {
    try {
      setLoading(true)
      setResult('')
      const response = await emailApi.sendDailyReportReminders()
      setResult(`✓ ${response.message} (対象: ${response.total_users}名)`)
    } catch (error) {
      console.error('日報リマインダーエラー:', error)
      setResult(`✗ 日報リマインダーの送信に失敗しました`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendContractRenewalNotifications = async () => {
    try {
      setLoading(true)
      setResult('')
      const response = await emailApi.sendContractRenewalNotifications()
      setResult(`✓ ${response.message} (対象: ${response.total_contracts}件)`)
    } catch (error) {
      console.error('契約更新通知エラー:', error)
      setResult(`✗ 契約更新通知の送信に失敗しました`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendWeeklyReports = async () => {
    try {
      setLoading(true)
      setResult('')
      const response = await emailApi.sendWeeklyReports()
      setResult(`✓ ${response.message} (対象: ${response.total_users}名)`)
    } catch (error) {
      console.error('週次レポート送信エラー:', error)
      setResult(`✗ 週次レポートの送信に失敗しました`)
    } finally {
      setLoading(false)
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
            メール通知設定
          </h1>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* 結果表示 */}
        {result && (
          <Card className={result.startsWith('✓') ? 'border-green-500' : 'border-red-500'}>
            <CardContent className="pt-6">
              <p className={result.startsWith('✓') ? 'text-green-600' : 'text-red-600'}>
                {result}
              </p>
            </CardContent>
          </Card>
        )}

        {/* テストメール */}
        <Card>
          <CardHeader>
            <CardTitle>テストメール送信</CardTitle>
            <CardDescription>
              メール送信機能のテストを行います
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">送信先メールアドレス</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="example@example.com"
                value={testEmail.to_email}
                onChange={(e) => setTestEmail({ ...testEmail, to_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-subject">件名</Label>
              <Input
                id="test-subject"
                placeholder="件名"
                value={testEmail.subject}
                onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-message">メッセージ</Label>
              <Textarea
                id="test-message"
                placeholder="メッセージ本文"
                value={testEmail.message}
                onChange={(e) => setTestEmail({ ...testEmail, message: e.target.value })}
                rows={4}
              />
            </div>
            <Button
              onClick={handleSendTestEmail}
              disabled={loading || !testEmail.to_email}
            >
              {loading ? '送信中...' : 'テストメールを送信'}
            </Button>
          </CardContent>
        </Card>

        {/* 自動通知 */}
        <Card>
          <CardHeader>
            <CardTitle>自動通知</CardTitle>
            <CardDescription>
              各種通知を手動で一括送信できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 案件期限通知 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">案件期限通知</CardTitle>
                  <CardDescription>
                    受注予定日が3日以内の案件について、担当者に通知します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleSendDealDeadlineNotifications}
                    disabled={loading}
                    className="w-full"
                  >
                    送信
                  </Button>
                </CardContent>
              </Card>

              {/* 活動フォローアップ通知 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">活動フォローアップ通知</CardTitle>
                  <CardDescription>
                    次のアクション実施日が1日以内の活動について、担当者に通知します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleSendActivityFollowUpNotifications}
                    disabled={loading}
                    className="w-full"
                  >
                    送信
                  </Button>
                </CardContent>
              </Card>

              {/* 日報リマインダー */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">日報提出リマインダー</CardTitle>
                  <CardDescription>
                    前日の日報が未提出の営業担当者にリマインダーを送信します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleSendDailyReportReminders}
                    disabled={loading}
                    className="w-full"
                  >
                    送信
                  </Button>
                </CardContent>
              </Card>

              {/* 契約更新通知 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">契約更新通知</CardTitle>
                  <CardDescription>
                    更新期限が30日以内の契約について、担当者に通知します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleSendContractRenewalNotifications}
                    disabled={loading}
                    className="w-full"
                  >
                    送信
                  </Button>
                </CardContent>
              </Card>

              {/* 週次レポート */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">週次レポート送信</CardTitle>
                  <CardDescription>
                    全営業担当者に今週の活動レポートを送信します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleSendWeeklyReports}
                    disabled={loading}
                    className="w-full md:w-auto"
                  >
                    送信
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">注意事項</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>
              • メール通知は、各ユーザーのプロフィールに登録されているメールアドレスに送信されます。
            </p>
            <p>
              • 本番環境では、SMTP設定（SMTP_HOST、SMTP_PORT、SMTP_USER、SMTP_PASSWORD）が必要です。
            </p>
            <p>
              • テスト環境では、メール送信機能が無効化されている場合があります。
            </p>
            <p>
              • 自動通知は手動送信も可能ですが、cron等で定期実行することを推奨します。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
