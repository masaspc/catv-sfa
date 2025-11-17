import api from './api'

export interface DailyReport {
  id: number
  report_date: string
  start_time?: string
  end_time?: string
  visits_count?: number
  new_contacts_count?: number
  deals_count?: number
  orders_count?: number
  content?: string
  insights?: string
  tomorrow_plan?: string
  attachments?: string
  sales_person_id: number
  created_at: string
  updated_at?: string
}

export interface DailyReportCreate {
  report_date: string
  start_time?: string
  end_time?: string
  visits_count?: number
  new_contacts_count?: number
  deals_count?: number
  orders_count?: number
  content?: string
  insights?: string
  tomorrow_plan?: string
  attachments?: string
}

export const dailyReportsApi = {
  // 日報一覧取得
  getDailyReports: async (skip: number = 0, limit: number = 100): Promise<DailyReport[]> => {
    const response = await api.get<DailyReport[]>(`/daily-reports?skip=${skip}&limit=${limit}`)
    return response.data
  },

  // 日報詳細取得
  getDailyReport: async (id: number): Promise<DailyReport> => {
    const response = await api.get<DailyReport>(`/daily-reports/${id}`)
    return response.data
  },

  // 指定日の日報取得
  getDailyReportByDate: async (date: string): Promise<DailyReport> => {
    const response = await api.get<DailyReport>(`/daily-reports/by-date?report_date=${date}`)
    return response.data
  },

  // 日報作成
  createDailyReport: async (data: DailyReportCreate): Promise<DailyReport> => {
    const response = await api.post<DailyReport>('/daily-reports', data)
    return response.data
  },

  // 日報更新
  updateDailyReport: async (id: number, data: Partial<DailyReportCreate>): Promise<DailyReport> => {
    const response = await api.put<DailyReport>(`/daily-reports/${id}`, data)
    return response.data
  },

  // 日報削除
  deleteDailyReport: async (id: number): Promise<void> => {
    await api.delete(`/daily-reports/${id}`)
  },
}
