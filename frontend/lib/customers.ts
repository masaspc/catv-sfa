import api from './api'

export interface Customer {
  id: number
  name: string
  name_kana?: string
  phone_primary?: string
  phone_secondary?: string
  email?: string
  postal_code?: string
  prefecture?: string
  city?: string
  address_line1?: string
  address_line2?: string
  birth_date?: string
  customer_type: string
  sales_person_id?: number
  created_at: string
  updated_at?: string
}

export interface CustomerList {
  total: number
  items: Customer[]
}

export interface CustomerCreate {
  name: string
  name_kana?: string
  phone_primary?: string
  phone_secondary?: string
  email?: string
  postal_code?: string
  prefecture?: string
  city?: string
  address_line1?: string
  address_line2?: string
  birth_date?: string
  customer_type?: string
  sales_person_id?: number
}

export const customersApi = {
  // 顧客一覧取得
  getCustomers: async (skip: number = 0, limit: number = 100): Promise<CustomerList> => {
    const response = await api.get<CustomerList>(`/customers?skip=${skip}&limit=${limit}`)
    return response.data
  },

  // 顧客詳細取得
  getCustomer: async (id: number): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`)
    return response.data
  },

  // 顧客作成
  createCustomer: async (data: CustomerCreate): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', data)
    return response.data
  },

  // 顧客更新
  updateCustomer: async (id: number, data: Partial<CustomerCreate>): Promise<Customer> => {
    const response = await api.put<Customer>(`/customers/${id}`, data)
    return response.data
  },

  // 顧客削除
  deleteCustomer: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`)
  },

  // 顧客検索
  searchCustomers: async (query: string): Promise<Customer[]> => {
    const response = await api.get<Customer[]>(`/customers/search?query=${query}`)
    return response.data
  },
}
