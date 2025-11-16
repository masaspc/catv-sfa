import { create } from 'zustand'
import { authApi, User } from '../auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const tokenResponse = await authApi.login({ username, password })
      const token = tokenResponse.access_token

      // トークンをローカルストレージに保存
      localStorage.setItem('access_token', token)

      // ユーザー情報を取得
      const user = await authApi.getCurrentUser()

      set({ user, token, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'ログインに失敗しました'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ user: null, token: null })
      return
    }

    try {
      const user = await authApi.getCurrentUser()
      set({ user, token })
    } catch (error) {
      localStorage.removeItem('access_token')
      set({ user: null, token: null })
    }
  },
}))
