import api from './api'

export interface Property {
  id: number
  property_name: string
  postal_code?: string
  prefecture?: string
  city?: string
  address_line1?: string
  address_line2?: string
  property_type?: string
  total_units?: number
  floors?: number
  built_year?: number
  management_type?: string
  management_company_name?: string
  management_contact_person?: string
  management_phone?: string
  management_email?: string
  owner_name?: string
  owner_phone?: string
  owner_email?: string
  catv_status: string
  sales_status: string
  bulk_contract_service?: string
  facility_fee_monthly?: number
  contract_start_date?: string
  construction_date?: string
  competitor_info?: string
  latitude?: number
  longitude?: number
  notes?: string
  sales_person_id?: number
  created_at: string
  updated_at?: string
}

export interface PropertyList {
  total: number
  items: Property[]
}

export interface PropertyCreate {
  property_name: string
  postal_code?: string
  prefecture?: string
  city?: string
  address_line1?: string
  address_line2?: string
  property_type?: string
  total_units?: number
  floors?: number
  built_year?: number
  management_type?: string
  management_company_name?: string
  catv_status?: string
  sales_status?: string
  sales_person_id?: number
}

export const propertiesApi = {
  // 集合住宅一覧取得
  getProperties: async (skip: number = 0, limit: number = 100): Promise<PropertyList> => {
    const response = await api.get<PropertyList>(`/properties?skip=${skip}&limit=${limit}`)
    return response.data
  },

  // 集合住宅詳細取得
  getProperty: async (id: number): Promise<Property> => {
    const response = await api.get<Property>(`/properties/${id}`)
    return response.data
  },

  // 集合住宅作成
  createProperty: async (data: PropertyCreate): Promise<Property> => {
    const response = await api.post<Property>('/properties', data)
    return response.data
  },

  // 集合住宅更新
  updateProperty: async (id: number, data: Partial<PropertyCreate>): Promise<Property> => {
    const response = await api.put<Property>(`/properties/${id}`, data)
    return response.data
  },

  // 集合住宅削除
  deleteProperty: async (id: number): Promise<void> => {
    await api.delete(`/properties/${id}`)
  },

  // 集合住宅検索
  searchProperties: async (query: string): Promise<Property[]> => {
    const response = await api.get<Property[]>(`/properties/search?query=${query}`)
    return response.data
  },
}
