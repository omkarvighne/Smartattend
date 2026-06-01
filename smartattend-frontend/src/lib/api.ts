import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const BASE = `${API_URL}/api/v1`

const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor — attach access token ─────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ── Response interceptor — refresh on 401 ─────────────────────────────────────

let isRefreshing = false
let queue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    isRefreshing = true
    const refreshToken = localStorage.getItem('refresh_token')

    try {
      const { data } = await axios.post(`${BASE}/auth/refresh`, {
        refresh_token: refreshToken,
      })
      const newToken: string = data.access_token
      localStorage.setItem('access_token', newToken)
      localStorage.setItem('refresh_token', data.refresh_token)
      queue.forEach((p) => p.resolve(newToken))
      queue = []
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (e) {
      queue.forEach((p) => p.reject(e))
      queue = []
      localStorage.clear()
      window.location.href = '/auth/login'
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  }
)

// ── Auth ───────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
  me: () => api.get('/auth/me'),
}

// ── Students ───────────────────────────────────────────────────────────────────

export const studentsApi = {
  list: (params?: { semester?: number; department_id?: number }) =>
    api.get('/students', { params }),
  mySummary: () => api.get('/students/me/summary'),
  faceEnroll: (embedding: number[]) =>
    api.post('/students/me/face-enroll', { embedding }),
  create: (data: {
    name: string; email: string; password: string
    prn: string; department_id: number; semester: number
  }) => api.post('/students', data),
}

// ── Teachers ───────────────────────────────────────────────────────────────────

export const teachersApi = {
  list: () => api.get('/teachers'),
  myCourses: () => api.get('/teachers/me/courses'),
  create: (data: {
    name: string; email: string; password: string
    employee_id: string; department_id?: number
  }) => api.post('/teachers', data),
}

// ── Attendance ─────────────────────────────────────────────────────────────────

export const attendanceApi = {
  createSession: (course_id: number, duration_minutes = 30) =>
    api.post('/attendance/sessions', { course_id, duration_minutes }),
  refreshQR: (session_id: number) =>
    api.post(`/attendance/sessions/${session_id}/refresh-qr`),
  closeSession: (session_id: number) =>
    api.patch(`/attendance/sessions/${session_id}/close`),
  mark: (session_token: string, face_embedding: number[]) =>
    api.post('/attendance/mark', { session_token, face_embedding }),
  mySummary: () => api.get('/attendance/my-summary'),
  defaulters: (course_id: number) =>
    api.get(`/attendance/courses/${course_id}/defaulters`),
}

// ── Courses ────────────────────────────────────────────────────────────────────

export const coursesApi = {
  list: (params?: { semester?: number; department_id?: number }) =>
    api.get('/courses', { params }),
  get: (id: number) => api.get(`/courses/${id}`),
  create: (data: {
    name: string; code: string; teacher_id: number
    department_id: number; semester: number
  }) => api.post('/courses', data),
}

// ── Departments ────────────────────────────────────────────────────────────────

export const departmentsApi = {
  list: () => api.get('/departments'),
  create: (data: { name: string; code: string }) =>
    api.post('/departments', data),
}

export default api
