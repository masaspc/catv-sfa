import api from './api'

export interface DashboardKPIs {
  visits_count: number
  orders_count: number
  active_contracts_count: number
  activities_count: number
  ongoing_deals_count: number
  achievement_rate: number
  period: string
}

export interface ActivitiesByType {
  [activityType: string]: number
}

export interface DealsByPhase {
  [phase: string]: number
}

export interface RevenueTrendItem {
  month: string
  revenue: number
  label: string
}

export interface PipelineValueItem {
  phase: string
  label: string
  value: number
  count: number
  order: number
}

export interface WinRateTrendItem {
  month: string
  rate: number
  won: number
  total: number
  label: string
}

export const dashboardApi = {
  getKPIs: async (): Promise<DashboardKPIs> => {
    const response = await api.get('/dashboard/kpis')
    return response.data
  },

  getActivitiesByType: async (): Promise<ActivitiesByType> => {
    const response = await api.get('/dashboard/activities-by-type')
    return response.data
  },

  getDealsByPhase: async (): Promise<DealsByPhase> => {
    const response = await api.get('/dashboard/deals-by-phase')
    return response.data
  },

  getRevenueTrend: async (months: number = 6): Promise<RevenueTrendItem[]> => {
    const response = await api.get(`/dashboard/revenue-trend?months=${months}`)
    return response.data
  },

  getPipelineValue: async (): Promise<PipelineValueItem[]> => {
    const response = await api.get('/dashboard/pipeline-value')
    return response.data
  },

  getWinRateTrend: async (months: number = 6): Promise<WinRateTrendItem[]> => {
    const response = await api.get(`/dashboard/win-rate-trend?months=${months}`)
    return response.data
  },
}
