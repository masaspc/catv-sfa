import api from './api'

export interface Activity {
  id: number
  activity_date: string
  activity_type: string
  customer_id?: number
  property_id?: number
  deal_id?: number
  content?: string
  result?: string
  next_action?: string
  next_action_date?: string
  attachments?: string
  latitude?: string
  longitude?: string
  sales_person_id?: number
  created_at: string
  updated_at?: string
}

export interface ActivityCreate {
  activity_date: string
  activity_type: string
  customer_id?: number
  property_id?: number
  deal_id?: number
  content?: string
  result?: string
  next_action?: string
  next_action_date?: string
  attachments?: string
  latitude?: string
  longitude?: string
}

export const activitiesApi = {
  // 営業活動一覧取得
  getActivities: async (skip: number = 0, limit: number = 100): Promise<Activity[]> => {
    const response = await api.get<Activity[]>(`/activities?skip=${skip}&limit=${limit}`)
    return response.data
  },

  // 営業活動詳細取得
  getActivity: async (id: number): Promise<Activity> => {
    const response = await api.get<Activity>(`/activities/${id}`)
    return response.data
  },

  // 営業活動作成
  createActivity: async (data: ActivityCreate): Promise<Activity> => {
    const response = await api.post<Activity>('/activities', data)
    return response.data
  },

  // 営業活動更新
  updateActivity: async (id: number, data: Partial<ActivityCreate>): Promise<Activity> => {
    const response = await api.put<Activity>(`/activities/${id}`, data)
    return response.data
  },

  // 営業活動削除
  deleteActivity: async (id: number): Promise<void> => {
    await api.delete(`/activities/${id}`)
  },
}
