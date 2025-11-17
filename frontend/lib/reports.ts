import api from './api'

export interface ReportData {
  summary: {
    period_start: string
    period_end: string
    total_deals: number
    won_deals: number
    lost_deals: number
    win_rate: number
    total_activities: number
    total_daily_reports: number
    avg_activities_per_day: number
  }
  deals_by_phase: { [key: string]: number }
  deals_by_type: { [key: string]: number }
  revenue_metrics: {
    total_estimated_amount: number
    won_amount: number
    forecast_revenue: number
    total_revenue: number
  }
  activity_metrics: {
    total_activities: number
    by_type: { [key: string]: number }
  }
  top_performers: Array<{
    user_id: number
    full_name: string
    won_deals: number
    won_amount: number
  }>
  contract_metrics: {
    total_contracts: number
    by_status: { [key: string]: number }
    total_contract_amount: number
  }
}

export interface Report {
  id: number
  user_id: number
  report_type: string
  period_start: string
  period_end: string
  title: string
  description?: string
  data: ReportData
  created_at: string
}

export interface ReportSummary {
  id: number
  report_type: string
  period_start: string
  period_end: string
  title: string
  created_at: string
}

export interface ReportGenerate {
  report_type: 'monthly' | 'weekly' | 'custom'
  period_start: string
  period_end: string
  include_charts?: boolean
  sales_person_id?: number
}

export const reportsApi = {
  // レポート一覧取得
  getReports: async (skip: number = 0, limit: number = 100, reportType?: string): Promise<ReportSummary[]> => {
    let url = `/reports?skip=${skip}&limit=${limit}`
    if (reportType) {
      url += `&report_type=${reportType}`
    }
    const response = await api.get<ReportSummary[]>(url)
    return response.data
  },

  // レポート詳細取得
  getReport: async (id: number): Promise<Report> => {
    const response = await api.get<Report>(`/reports/${id}`)
    return response.data
  },

  // レポート生成
  generateReport: async (data: ReportGenerate): Promise<Report> => {
    const response = await api.post<Report>('/reports/generate', data)
    return response.data
  },

  // レポート削除
  deleteReport: async (id: number): Promise<void> => {
    await api.delete(`/reports/${id}`)
  },
}
