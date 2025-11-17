'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { activitiesApi, Activity, ActivityCreate } from '@/lib/activities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const activityTypeOptions = [
  { value: 'visit', label: '訪問' },
  { value: 'call', label: '電話' },
  { value: 'email', label: 'メール' },
  { value: 'meeting', label: '打ち合わせ' },
  { value: 'other', label: 'その他' },
]

export default function ActivityEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Activity>>({
    activity_date: new Date().toISOString(),
    activity_type: 'visit',
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
      loadActivity()
    }
  }, [user, params.id])

  const loadActivity = async () => {
    try {
      setLoading(true)
      const activity = await activitiesApi.getActivity(parseInt(params.id))
      setFormData(activity)
    } catch (error) {
      console.error('営業活動情報の取得に失敗しました:', error)
      alert('営業活動情報の取得に失敗しました')
      router.push('/activities')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      await activitiesApi.updateActivity(parseInt(params.id), formData as ActivityCreate)
      alert('営業活動を更新しました')
      router.push(`/activities/${params.id}`)
    } catch (error) {
      console.error('更新に失敗しました:', error)
      alert('営業活動の更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Activity, value: any) => {
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
            営業活動編集
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
                <CardDescription>営業活動の基本的な情報を入力してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="activity_date">活動日時 <span className="text-red-500">*</span></Label>
                  <Input
                    id="activity_date"
                    type="datetime-local"
                    required
                    value={formData.activity_date?.slice(0, 16) || ''}
                    onChange={(e) => handleChange('activity_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="activity_type">活動種別 <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.activity_type || 'visit'}
                    onValueChange={(value) => handleChange('activity_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 活動内容 */}
            <Card>
              <CardHeader>
                <CardTitle>活動内容</CardTitle>
                <CardDescription>活動の詳細を記入してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">活動内容</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="活動内容を記入してください"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="result">実施結果</Label>
                  <Textarea
                    id="result"
                    value={formData.result || ''}
                    onChange={(e) => handleChange('result', e.target.value)}
                    placeholder="実施結果を記入してください"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 次回アクション */}
            <Card>
              <CardHeader>
                <CardTitle>次回アクション</CardTitle>
                <CardDescription>次回の予定を記入してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="next_action">次回アクション</Label>
                  <Textarea
                    id="next_action"
                    value={formData.next_action || ''}
                    onChange={(e) => handleChange('next_action', e.target.value)}
                    placeholder="次回のアクションを記入してください"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="next_action_date">次回アクション日時</Label>
                  <Input
                    id="next_action_date"
                    type="datetime-local"
                    value={formData.next_action_date?.slice(0, 16) || ''}
                    onChange={(e) => handleChange('next_action_date', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 関連情報 */}
            <Card>
              <CardHeader>
                <CardTitle>関連情報</CardTitle>
                <CardDescription>顧客・集合住宅・案件との紐付け</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

                  <div>
                    <Label htmlFor="deal_id">案件ID</Label>
                    <Input
                      id="deal_id"
                      type="number"
                      min="0"
                      value={formData.deal_id || ''}
                      onChange={(e) => handleChange('deal_id', parseInt(e.target.value) || undefined)}
                      placeholder="案件ID"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 位置情報 */}
            <Card>
              <CardHeader>
                <CardTitle>位置情報</CardTitle>
                <CardDescription>活動場所の座標（任意）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="latitude">緯度</Label>
                    <Input
                      id="latitude"
                      type="text"
                      value={formData.latitude || ''}
                      onChange={(e) => handleChange('latitude', e.target.value)}
                      placeholder="35.6762"
                    />
                  </div>

                  <div>
                    <Label htmlFor="longitude">経度</Label>
                    <Input
                      id="longitude"
                      type="text"
                      value={formData.longitude || ''}
                      onChange={(e) => handleChange('longitude', e.target.value)}
                      placeholder="139.6503"
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
                onClick={() => router.push(`/activities/${params.id}`)}
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
