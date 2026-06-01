import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// Change this to your Mac's local IP when testing on physical device
// e.g. 'http://192.168.1.100:8000'
const API_URL = 'http://192.168.1.100:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token on every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = await SecureStore.getItemAsync('refresh_token')
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refresh })
        await SecureStore.setItemAsync('access_token', data.access_token)
        await SecureStore.setItemAsync('refresh_token', data.refresh_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        await SecureStore.deleteItemAsync('access_token')
        await SecureStore.deleteItemAsync('refresh_token')
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

export const attendanceApi = {
  mark: (session_token: string, face_embedding: number[]) =>
    api.post('/attendance/mark', { session_token, face_embedding }),
  mySummary: () => api.get('/attendance/my-summary'),
}

export const studentsApi = {
  mySummary: () => api.get('/students/me/summary'),
}

export default api
