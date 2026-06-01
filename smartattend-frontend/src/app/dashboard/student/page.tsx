'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ScanFace, TrendingUp, BookOpen, AlertTriangle, ArrowRight, CheckCircle, XCircle, Clock, Camera } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { studentsApi } from '@/lib/api'
import { PieChart, Pie, Cell } from 'recharts'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
}

const mockSummary = {
  overall_percentage: 76.4,
  is_defaulter: false,
  face_enrolled: false,
  course_stats: [
    { course_name: 'Data Structures', course_code: 'CSE301', attended: 34, total_sessions: 38, percentage: 89.5 },
    { course_name: 'Operating Systems', course_code: 'CSE302', attended: 31, total_sessions: 38, percentage: 81.6 },
    { course_name: 'DBMS', course_code: 'CSE303', attended: 29, total_sessions: 38, percentage: 76.3 },
    { course_name: 'Computer Networks', course_code: 'CSE304', attended: 27, total_sessions: 38, percentage: 71.1 },
    { course_name: 'Software Engineering', course_code: 'CSE305', attended: 26, total_sessions: 38, percentage: 68.4 },
  ],
}

const recentActivity = [
  { course: 'Data Structures', date: 'Today 10:00 AM', status: 'present' },
  { course: 'Operating Systems', date: 'Today 11:30 AM', status: 'present' },
  { course: 'DBMS', date: 'Yesterday 2:00 PM', status: 'absent' },
  { course: 'Computer Networks', date: 'Yesterday 10:00 AM', status: 'present' },
  { course: 'Software Engineering', date: '2 days ago', status: 'absent' },
]

export default function StudentDashboard() {
  const user = useAuthStore(s => s.user)

  const { data: summary = mockSummary } = useQuery({
    queryKey: ['student-summary'],
    queryFn: () => studentsApi.mySummary().then(r => r.data).catch(() => mockSummary),
    staleTime: 60_000,
  })

  const overallPct = summary.overall_percentage || 0
  const atRisk = summary.course_stats?.filter((c: any) => c.percentage < 75) || []
  const safe = summary.course_stats?.filter((c: any) => c.percentage >= 75) || []
  const faceEnrolled = summary.face_enrolled ?? user?.face_enrolled ?? false

  const pieData = [
    { name: 'Present', value: Math.round(overallPct) },
    { name: 'Absent', value: 100 - Math.round(overallPct) },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">
            Hi, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Your attendance overview for this semester.</p>
        </div>
        <Link href="/attendance/mark" className="btn-gradient hidden sm:flex">
          <ScanFace size={16} /> Mark Attendance
        </Link>
      </motion.div>

      {/* Face enrollment banner — shown if not enrolled */}
      {!faceEnrolled && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.5}
          className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
            <Camera size={20} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm">Face not enrolled yet</div>
            <div className="text-indigo-600 dark:text-indigo-400 text-xs mt-0.5">
              You need to enroll your face to mark attendance. It only takes 30 seconds.
            </div>
          </div>
          <Link href="/dashboard/student/face-enroll" className="btn-gradient btn-sm flex-shrink-0">
            <Camera size={13} /> Enroll Now
          </Link>
        </motion.div>
      )}

      {/* Face enrolled success banner */}
      {faceEnrolled && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.5}
          className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl"
        >
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Face enrolled ✓ — you can mark attendance with face verification</span>
          <Link href="/dashboard/student/face-enroll" className="ml-auto text-xs text-emerald-600 underline">Update</Link>
        </motion.div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Attendance', value: `${overallPct.toFixed(1)}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Courses Enrolled', value: summary.course_stats?.length || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Courses Safe', value: safe.length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Courses At Risk', value: atRisk.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show" custom={i + 1} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Alert banner */}
      {atRisk.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}
          className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl"
        >
          <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Attendance Warning</div>
            <div className="text-amber-700 dark:text-amber-300 text-xs mt-0.5">
              Below 75% in <strong>{atRisk.map((c: any) => c.course_name).join(', ')}</strong>. Attend all remaining classes.
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Donut */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} className="card p-5 text-center">
          <div className="section-title text-base mb-1">Overall</div>
          <div className="section-sub text-xs mb-4">Semester attendance</div>
          <div className="relative inline-block">
            <PieChart width={160} height={160}>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                <Cell fill={overallPct >= 75 ? '#10b981' : '#f59e0b'} />
                <Cell fill="#f1f5f9" />
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-display font-black text-slate-900 dark:text-white">{Math.round(overallPct)}%</div>
              <div className="text-xs text-slate-400">present</div>
            </div>
          </div>
          <div className={`mt-3 badge ${overallPct >= 75 ? 'badge-green' : 'badge-amber'} mx-auto`}>
            {overallPct >= 75 ? '✓ Above threshold' : '⚠ Below 75%'}
          </div>
          {/* Face enroll button always visible */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Link href="/dashboard/student/face-enroll"
              className={`btn btn-sm w-full justify-center ${faceEnrolled ? 'btn-secondary' : 'btn-gradient'}`}>
              <Camera size={13} /> {faceEnrolled ? 'Update Face' : 'Enroll Face'}
            </Link>
          </div>
        </motion.div>

        {/* Subject bars */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title text-base">Subject-wise Attendance</div>
            <Link href="/dashboard/student/attendance" className="btn-ghost btn-sm text-xs">
              Full history <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3.5">
            {summary.course_stats?.map((c: any) => (
              <div key={c.course_code}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.course_name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{c.attended}/{c.total_sessions}</span>
                    <span className={`text-xs font-bold ${c.percentage >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {Number(c.percentage).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="progress-bar h-2">
                  <motion.div
                    className={`progress-fill ${c.percentage >= 75 ? 'bg-emerald-500' : c.percentage >= 65 ? 'bg-amber-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }} animate={{ width: `${c.percentage}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8} className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title text-base">Recent Activity</div>
          <Link href="/dashboard/student/attendance" className="btn-ghost btn-sm text-xs">View all <ArrowRight size={12} /></Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {recentActivity.map(({ course, date, status }) => (
            <div key={course + date} className="flex items-center gap-4 py-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${status === 'present' ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                {status === 'present' ? <CheckCircle size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-white">{course}</div>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <Clock size={11} /> {date}
                </div>
              </div>
              <span className={`badge ${status === 'present' ? 'badge-green' : 'badge-red'}`}>
                {status === 'present' ? 'Present' : 'Absent'}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
