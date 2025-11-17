import apiClient from './api-client'

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

export const dashboardApi = {
  getKPIs: async (): Promise<DashboardKPIs> => {
    const response = await apiClient.get('/dashboard/kpis')
    return response.data
  },

  getActivitiesByType: async (): Promise<ActivitiesByType> => {
    const response = await apiClient.get('/dashboard/activities-by-type')
    return response.data
  },

  getDealsByPhase: async (): Promise<DealsByPhase> => {
    const response = await apiClient.get('/dashboard/deals-by-phase')
    return response.data
  },
}
