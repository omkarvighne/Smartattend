import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { authApi } from '../lib/api'

interface User { id: number; name: string; email: string; role: string }

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      console.log('LOGIN ATTEMPT:', email, password)
      const { data } = await authApi.login(email, password)
      console.log('LOGIN SUCCESS:', JSON.stringify(data))
      await SecureStore.setItemAsync('access_token', data.access_token)
      await SecureStore.setItemAsync('refresh_token', data.refresh_token)
      const { data: user } = await authApi.me()
      console.log('ME SUCCESS:', JSON.stringify(user))
      set({ user, isLoggedIn: true, isLoading: false })
    } catch (e: any) {
      console.log('LOGIN ERROR:', e?.message, e?.response?.status, JSON.stringify(e?.response?.data))
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
