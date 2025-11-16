import api from './api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  role: string
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export const authApi = {
  // ログイン
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await api.post<TokenResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 現在のユーザー情報取得
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me')
    return response.data
  },

  // トークン検証
  testToken: async (): Promise<User> => {
    const response = await api.post<User>('/auth/test-token')
    return response.data
  },
}
