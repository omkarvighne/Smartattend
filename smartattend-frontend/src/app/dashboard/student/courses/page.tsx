'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, QrCode, TrendingUp, User } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.38, delay: i * 0.07 } }),
}

const enrolledCourses = [
  { id: 1, name: 'Data Structures & Algorithms', code: 'CSE301', teacher: 'Prof. R. Patil', semester: 3, attended: 34, total: 38, pct: 89.5, color: 'from-indigo-500 to-purple-600' },
  { id: 2, name: 'Operating Systems', code: 'CSE302', teacher: 'Prof. R. Patil', semester: 3, attended: 31, total: 38, pct: 81.6, color: 'from-blue-500 to-indigo-600' },
  { id: 3, name: 'Database Management Systems', code: 'CSE303', teacher: 'Prof. R. Patil', semester: 4, attended: 29, total: 38, pct: 76.3, color: 'from-purple-500 to-pink-600' },
  { id: 4, name: 'Computer Networks', code: 'CSE304', teacher: 'Prof. S. Kulkarni', semester: 4, attended: 27, total: 38, pct: 71.1, color: 'from-amber-500 to-orange-600' },
  { id: 5, name: 'Software Engineering', code: 'CSE305', teacher: 'Prof. S. Kulkarni', semester: 4, attended: 26, total: 38, pct: 68.4, color: 'from-rose-500 to-pink-600' },
]

export default function StudentCoursesPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">My Courses</h1>
        <p className="text-slate-500 text-sm mt-0.5">You are enrolled in {enrolledCourses.length} courses this semester.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {enrolledCourses.map(({ id, name, code, teacher, attended, total, pct, color }, i) => (
          <motion.div key={id} variants={fadeUp} initial="hidden" animate="show" custom={i} className="card-hover p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <BookOpen size={18} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-slate-900 dark:text-white text-sm leading-snug truncate">{name}</div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">{code}</div>
              </div>
              <span className={`badge flex-shrink-0 ${pct >= 75 ? 'badge-green' : 'badge-red'}`}>{pct.toFixed(0)}%</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
              <User size={11} />
              <span>{teacher}</span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500">{attended} of {total} classes attended</span>
                <span className={`font-semibold ${pct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{pct.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className={`progress-fill ${pct >= 80 ? 'bg-emerald-500' : pct >= 75 ? 'bg-indigo-500' : pct >= 65 ? 'bg-amber-500' : 'bg-red-500'}`}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 + i * 0.08 }}
                />
              </div>
            </div>

            {pct < 75 && (
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mb-3">
                ⚠ Below 75% threshold. Attend all upcoming classes.
              </div>
            )}

            <div className="flex gap-2">
              <Link href="/attendance/mark" className="btn-gradient btn-sm flex-1 justify-center text-xs">
                <QrCode size={12} /> Mark Attendance
              </Link>
              <Link href="/dashboard/student/attendance" className="btn-secondary btn-sm flex-1 justify-center text-xs">
                <TrendingUp size={12} /> View History
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
