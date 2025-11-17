import api from './api'

export interface Contract {
  id: number
  customer_id?: number
  property_id?: number
  service_type: string
  plan_name?: string
  monthly_fee?: number
  start_date?: string
  end_date?: string
  payment_method?: string
  notes?: string
  created_at: string
  updated_at?: string
}

export interface ContractCreate {
  customer_id?: number
  property_id?: number
  service_type: string
  plan_name?: string
  monthly_fee?: number
  start_date?: string
  end_date?: string
  payment_method?: string
  notes?: string
}

export const contractsApi = {
  // 契約一覧取得
  getContracts: async (skip: number = 0, limit: number = 100): Promise<Contract[]> => {
    const response = await api.get<Contract[]>(`/contracts?skip=${skip}&limit=${limit}`)
    return response.data
  },

  // 有効な契約一覧取得
  getActiveContracts: async (skip: number = 0, limit: number = 100): Promise<Contract[]> => {
    const response = await api.get<Contract[]>(`/contracts/active?skip=${skip}&limit=${limit}`)
    return response.data
  },

  // 契約詳細取得
  getContract: async (id: number): Promise<Contract> => {
    const response = await api.get<Contract>(`/contracts/${id}`)
    return response.data
  },

  // 契約作成
  createContract: async (data: ContractCreate): Promise<Contract> => {
    const response = await api.post<Contract>('/contracts', data)
    return response.data
  },

  // 契約更新
  updateContract: async (id: number, data: Partial<ContractCreate>): Promise<Contract> => {
    const response = await api.put<Contract>(`/contracts/${id}`, data)
    return response.data
  },

  // 契約削除
  deleteContract: async (id: number): Promise<void> => {
    await api.delete(`/contracts/${id}`)
  },

  // 契約検索
  searchContracts: async (query: string): Promise<Contract[]> => {
    const response = await api.get<Contract[]>(`/contracts/search?query=${query}`)
    return response.data
  },
}
