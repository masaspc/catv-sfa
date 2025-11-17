'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { activitiesApi, ActivityCreate } from '@/lib/activities'
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

export default function ActivityNewPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ActivityCreate>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const newActivity = await activitiesApi.createActivity(formData)
      alert('営業活動を登録しました')
      router.push(`/activities/${newActivity.id}`)
    } catch (error) {
      console.error('登録に失敗しました:', error)
      alert('営業活動の登録に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof ActivityCreate, value: any) => {
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
            営業活動記録
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
                    value={formData.activity_type}
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

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/activities')}
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
