import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { authApi } from '../lib/api'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isLoggedIn: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.login(email, password)
      await SecureStore.setItemAsync('access_token', data.access_token)
      await SecureStore.setItemAsync('refresh_token', data.refresh_token)
      const { data: user } = await authApi.me()
      set({ user, isLoggedIn: true, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
    set({ user: null, isLoggedIn: false })
  },

  loadUser: async () => {
    const token = await SecureStore.getItemAsync('access_token')
    if (!token) return
    try {
      const { data } = await authApi.me()
      set({ user: data, isLoggedIn: true })
    } catch {
      await SecureStore.deleteItemAsync('access_token')
    }
  },
}))
