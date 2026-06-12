import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// ⚠️  Change this to your Mac's WiFi IP before running
// Run this in terminal to find your IP: ipconfig getifaddr en0
const API_URL = 'http://192.168.1.7:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
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
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

export const studentsApi = {
  mySummary: () => api.get('/students/me/summary'),
}

export const attendanceApi = {
  // Old mock mark (kept for fallback)
  mark: (session_token: string, face_embedding: number[]) =>
    api.post('/attendance/mark', { session_token, face_embedding }),

  // New real face verify + mark
  verifyAndMark: async (session_token: string, photoUri: string) => {
    const token = await SecureStore.getItemAsync('access_token')

    const formData = new FormData()
    formData.append('file', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'face.jpg',
    } as any)

    const response = await fetch(
      `${API_URL}/attendance/face/verify-and-mark?session_token=${encodeURIComponent(session_token)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail ?? 'Verification failed')
    }

    return response.json()
  },
}

export default api
