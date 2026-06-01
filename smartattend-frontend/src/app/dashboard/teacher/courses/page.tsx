'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Users, BarChart3, ArrowRight, QrCode } from 'lucide-react'
import { teachersApi } from '@/lib/api'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
}

const mockCourses = [
  { id: 1, name: 'Data Structures & Algorithms', code: 'CSE301', semester: 3, enrolled: 48, avgAttendance: 79, sessions: 12, department: { name: 'CSE' } },
  { id: 2, name: 'Operating Systems', code: 'CSE302', semester: 3, enrolled: 45, avgAttendance: 83, sessions: 10, department: { name: 'CSE' } },
  { id: 3, name: 'Database Management Systems', code: 'CSE303', semester: 4, enrolled: 40, avgAttendance: 71, sessions: 16, department: { name: 'CSE' } },
]

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
]

export default function TeacherCoursesPage() {
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => teachersApi.myCourses().then(r => r.data).catch(() => mockCourses),
    staleTime: 60_000,
  })

  const courses: any[] = coursesData || mockCourses

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">My Courses</h1>
        <p className="text-slate-500 text-sm mt-0.5">All courses assigned to you this semester.</p>
      </motion.div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Courses', value: courses.length, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Total Students', value: courses.reduce((a: number, c: any) => a + (c.enrolled || 0), 0), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Avg Attendance', value: courses.length ? `${(courses.reduce((a: number, c: any) => a + (c.avgAttendance || 0), 0) / courses.length).toFixed(0)}%` : '—', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(({ label, value, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show" custom={i} className={`rounded-xl p-4 ${bg}`}>
            <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Course cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))
          : courses.map((course: any, i: number) => {
              const pct = course.avgAttendance || 0
              return (
                <motion.div
                  key={course.id}
                  variants={fadeUp} initial="hidden" animate="show" custom={i}
                  className="card-hover p-5 flex flex-col gap-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center flex-shrink-0`}>
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <span className="badge badge-gray font-mono text-xs">{course.code}</span>
                  </div>

                  {/* Name */}
                  <div>
                    <div className="font-display font-bold text-slate-900 dark:text-white text-sm leading-snug">{course.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Semester {course.semester} · {course.department?.name || course.department || 'CSE'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-slate-700/50">
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-800 dark:text-white">{course.enrolled || '—'}</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                        <Users size={10} /> Students
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-800 dark:text-white">{course.sessions || 0}</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                        <QrCode size={10} /> Sessions
                      </div>
                    </div>
                  </div>

                  {/* Attendance bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Avg attendance</span>
                      <span className={`font-bold ${pct >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className={`progress-fill ${pct >= 80 ? 'bg-emerald-500' : pct >= 75 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 + i * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/teacher/session`}
                      className="btn-gradient btn-sm flex-1 justify-center text-xs"
                    >
                      <QrCode size={12} /> Start Session
                    </Link>
                    <Link
                      href="/dashboard/teacher/records"
                      className="btn-secondary btn-sm flex-1 justify-center text-xs"
                    >
                      <BarChart3 size={12} /> Records
                    </Link>
                  </div>
                </motion.div>
              )
            })}
      </div>
    </div>
  )
}
