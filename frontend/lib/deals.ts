import api from './api'

export interface Deal {
  id: number
  deal_name: string
  deal_type: string
  customer_id?: number
  property_id?: number
  estimated_amount?: number
  probability?: number
  phase?: string
  expected_close_date?: string
  actual_close_date?: string
  lost_reason?: string
  sales_person_id?: number
  created_at: string
  updated_at?: string
}

export interface DealCreate {
  deal_name: string
  deal_type: string
  customer_id?: number
  property_id?: number
  estimated_amount?: number
  probability?: number
  phase?: string
  expected_close_date?: string
  actual_close_date?: string
  lost_reason?: string
}

export const dealsApi = {
  // 案件一覧取得
  getDeals: async (skip: number = 0, limit: number = 100): Promise<Deal[]> => {
    const response = await api.get<Deal[]>(`/deals?skip=${skip}&limit=${limit}`)
    return response.data
  },

  // 案件詳細取得
  getDeal: async (id: number): Promise<Deal> => {
    const response = await api.get<Deal>(`/deals/${id}`)
    return response.data
  },

  // 案件作成
  createDeal: async (data: DealCreate): Promise<Deal> => {
    const response = await api.post<Deal>('/deals', data)
    return response.data
  },

  // 案件更新
  updateDeal: async (id: number, data: Partial<DealCreate>): Promise<Deal> => {
    const response = await api.put<Deal>(`/deals/${id}`, data)
    return response.data
  },

  // 案件削除
  deleteDeal: async (id: number): Promise<void> => {
    await api.delete(`/deals/${id}`)
  },

  // 案件検索
  searchDeals: async (query: string): Promise<Deal[]> => {
    const response = await api.get<Deal[]>(`/deals/search?query=${query}`)
    return response.data
  },

  // CSVエクスポート
  exportToCSV: async (): Promise<void> => {
    const response = await api.get('/deals/export/csv', {
      responseType: 'blob',
    })

    // ダウンロード用のリンクを作成
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    // ファイル名を設定（現在日時を含む）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    link.setAttribute('download', `deals_${timestamp}.csv`)

    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
