// ── Auth ──────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

// ── Student ───────────────────────────────────────────────────────────────────

export interface Student {
  id: number
  prn: string
  semester: number
  face_enrolled: boolean
  user: User
}

// ── Teacher ───────────────────────────────────────────────────────────────────

export interface Teacher {
  id: number
  employee_id: string
  user: User
}

// ── Course ────────────────────────────────────────────────────────────────────

export interface Course {
  id: number
  name: string
  code: string
  semester: number
  is_active: boolean
  teacher: Teacher
}

// ── Attendance Session ────────────────────────────────────────────────────────

export interface AttendanceSession {
  id: number
  course_id: number
  is_active: boolean
  qr_expires_at: string
  session_expires_at: string
  created_at: string
}

export interface QRResponse {
  session_id: number
  qr_token: string
  qr_image_b64: string
  expires_at: string
  present_count: number
}

// ── Attendance Record ─────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: number
  student_id: number
  session_id: number
  course_id: number
  marked_at: string
  verification_status: 'pending' | 'verified' | 'failed'
  similarity_score?: number
}

export interface MarkAttendanceResponse {
  success: boolean
  message: string
  record?: AttendanceRecord
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface CourseAttendanceStat {
  course_id: number
  course_name: string
  course_code: string
  total_sessions: number
  attended: number
  percentage: number
}

export interface StudentAttendanceSummary {
  student_id: number
  prn: string
  name: string
  overall_percentage: number
  is_defaulter: boolean
  course_stats: CourseAttendanceStat[]
}

export interface DefaulterRecord {
  student_id: number
  prn: string
  name: string
  course_id: number
  course_name: string
  percentage: number
}

// ── Nav ───────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}
