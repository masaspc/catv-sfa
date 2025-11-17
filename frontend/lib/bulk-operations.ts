import api from './api'

export interface BulkDeleteRequest {
  ids: number[]
}

export interface BulkUpdateDealsRequest {
  ids: number[]
  phase?: string
  sales_person_id?: number
}

export interface BulkUpdateActivitiesRequest {
  ids: number[]
  activity_type?: string
}

export interface BulkOperationResponse {
  success: boolean
  processed: number
  failed: number
  errors: string[]
}

export const bulkOperationsApi = {
  // 顧客の一括削除
  deleteCustomers: async (ids: number[]): Promise<BulkOperationResponse> => {
    const response = await api.post<BulkOperationResponse>('/bulk/customers/delete', { ids })
    return response.data
  },

  // 案件の一括削除
  deleteDeals: async (ids: number[]): Promise<BulkOperationResponse> => {
    const response = await api.post<BulkOperationResponse>('/bulk/deals/delete', { ids })
    return response.data
  },

  // 案件の一括更新
  updateDeals: async (request: BulkUpdateDealsRequest): Promise<BulkOperationResponse> => {
    const response = await api.post<BulkOperationResponse>('/bulk/deals/update', request)
    return response.data
  },

  // 営業活動の一括削除
  deleteActivities: async (ids: number[]): Promise<BulkOperationResponse> => {
    const response = await api.post<BulkOperationResponse>('/bulk/activities/delete', { ids })
    return response.data
  },

  // 営業活動の一括更新
  updateActivities: async (request: BulkUpdateActivitiesRequest): Promise<BulkOperationResponse> => {
    const response = await api.post<BulkOperationResponse>('/bulk/activities/update', request)
    return response.data
  },

  // 日報の一括削除
  deleteDailyReports: async (ids: number[]): Promise<BulkOperationResponse> => {
    const response = await api.post<BulkOperationResponse>('/bulk/daily-reports/delete', { ids })
    return response.data
  },
}
