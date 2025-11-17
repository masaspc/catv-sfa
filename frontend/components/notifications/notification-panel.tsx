'use client'

import { useEffect, useState } from 'react'
import { notificationsApi, Notification } from '@/lib/notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// 相対時間表示のヘルパー関数
const formatRelativeTime = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'たった今'
  if (diffMins < 60) return `${diffMins}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  return date.toLocaleDateString('ja-JP')
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  useEffect(() => {
    loadNotifications()
    loadUnreadCount()
  }, [showUnreadOnly])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsApi.getNotifications(0, 20, showUnreadOnly)
      setNotifications(data)
    } catch (error) {
      console.error('通知の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('未読数の取得に失敗しました:', error)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id)
      await loadNotifications()
      await loadUnreadCount()
    } catch (error) {
      console.error('既読処理に失敗しました:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      await loadNotifications()
      await loadUnreadCount()
    } catch (error) {
      console.error('一括既読処理に失敗しました:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('この通知を削除しますか？')) {
      return
    }

    try {
      await notificationsApi.deleteNotification(id)
      await loadNotifications()
      await loadUnreadCount()
    } catch (error) {
      console.error('通知の削除に失敗しました:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deal_deadline':
        return '📅'
      case 'activity_follow_up':
        return '🔔'
      case 'daily_report_missing':
        return '📝'
      default:
        return '📢'
    }
  }

  const getNotificationVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'deal_deadline':
        return 'destructive'
      case 'activity_follow_up':
        return 'default'
      case 'daily_report_missing':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle>通知</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={showUnreadOnly ? 'default' : 'outline'}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? '全件表示' : '未読のみ'}
            </Button>
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
                すべて既読
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">読み込み中...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              {showUnreadOnly ? '未読の通知はありません' : '通知はありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getNotificationIcon(notification.notification_type)}</span>
                      <Badge variant={getNotificationVariant(notification.notification_type)} className="text-xs">
                        {notification.notification_type}
                      </Badge>
                      {!notification.is_read && (
                        <Badge variant="default" className="text-xs">
                          未読
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                    {notification.message && (
                      <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-8 px-2 text-xs"
                      >
                        既読
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notification.id)}
                      className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
