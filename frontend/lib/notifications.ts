import api from './api'

export interface Notification {
  id: number
  user_id: number
  notification_type: string
  title: string
  message?: string
  related_id?: number
  related_type?: string
  is_read: boolean
  created_at: string
  updated_at?: string
}

export interface NotificationCreate {
  user_id: number
  notification_type: string
  title: string
  message?: string
  related_id?: number
  related_type?: string
}

export const notificationsApi = {
  // 通知一覧取得
  getNotifications: async (skip: number = 0, limit: number = 100, unreadOnly: boolean = false): Promise<Notification[]> => {
    const response = await api.get<Notification[]>(`/notifications?skip=${skip}&limit=${limit}&unread_only=${unreadOnly}`)
    return response.data
  },

  // 未読通知数取得
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<number>('/notifications/unread-count')
    return response.data
  },

  // 通知作成
  createNotification: async (data: NotificationCreate): Promise<Notification> => {
    const response = await api.post<Notification>('/notifications', data)
    return response.data
  },

  // 通知を既読にする
  markAsRead: async (id: number): Promise<Notification> => {
    const response = await api.put<Notification>(`/notifications/${id}/read`)
    return response.data
  },

  // すべての通知を既読にする
  markAllAsRead: async (): Promise<{ marked_count: number }> => {
    const response = await api.put<{ marked_count: number}>('/notifications/read-all')
    return response.data
  },

  // 通知削除
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`)
  },
}
