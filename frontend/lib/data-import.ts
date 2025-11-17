import api from './api'

export interface ImportResult {
  message: string
  imported: number
  failed: number
  total: number
  errors: string[]
}

export interface TemplateResponse {
  content: string
  filename: string
}

export const dataImportApi = {
  // 顧客データインポート
  importCustomers: async (file: File): Promise<ImportResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<ImportResult>('/import/customers/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 案件データインポート
  importDeals: async (file: File): Promise<ImportResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<ImportResult>('/import/deals/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 顧客テンプレートダウンロード
  getCustomerTemplate: async (): Promise<TemplateResponse> => {
    const response = await api.get<TemplateResponse>('/import/template/customers')
    return response.data
  },

  // 案件テンプレートダウンロード
  getDealTemplate: async (): Promise<TemplateResponse> => {
    const response = await api.get<TemplateResponse>('/import/template/deals')
    return response.data
  },
}
