'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.04 } }),
}

const history = [
  { date: '19 May 2025', course: 'Data Structures', code: 'CSE301', teacher: 'Prof. R. Patil', status: 'present', time: '10:00 AM', score: 0.94 },
  { date: '19 May 2025', course: 'Operating Systems', code: 'CSE302', teacher: 'Prof. R. Patil', status: 'present', time: '11:30 AM', score: 0.97 },
  { date: '18 May 2025', course: 'DBMS', code: 'CSE303', teacher: 'Prof. R. Patil', status: 'absent', time: '2:00 PM', score: null },
  { date: '17 May 2025', course: 'Computer Networks', code: 'CSE304', teacher: 'Prof. S. Kulkarni', status: 'present', time: '10:00 AM', score: 0.91 },
  { date: '17 May 2025', course: 'Software Engineering', code: 'CSE305', teacher: 'Prof. S. Kulkarni', status: 'present', time: '12:00 PM', score: 0.88 },
  { date: '16 May 2025', course: 'Data Structures', code: 'CSE301', teacher: 'Prof. R. Patil', status: 'absent', time: '10:00 AM', score: null },
  { date: '15 May 2025', course: 'Operating Systems', code: 'CSE302', teacher: 'Prof. R. Patil', status: 'present', time: '11:30 AM', score: 0.95 },
  { date: '15 May 2025', course: 'DBMS', code: 'CSE303', teacher: 'Prof. R. Patil', status: 'present', time: '2:00 PM', score: 0.92 },
  { date: '14 May 2025', course: 'Computer Networks', code: 'CSE304', teacher: 'Prof. S. Kulkarni', status: 'present', time: '10:00 AM', score: 0.89 },
  { date: '13 May 2025', course: 'Software Engineering', code: 'CSE305', teacher: 'Prof. S. Kulkarni', status: 'absent', time: '12:00 PM', score: null },
]

export default function StudentAttendanceHistoryPage() {
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all')
  const [courseFilter, setCourseFilter] = useState('all')

  const filtered = history.filter(h => {
    const matchStatus = filter === 'all' || h.status === filter
    const matchCourse = courseFilter === 'all' || h.code === courseFilter
    return matchStatus && matchCourse
  })

  const presentCount = history.filter(h => h.status === 'present').length
  const absentCount = history.filter(h => h.status === 'absent').length

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Attendance History</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your complete attendance record for this semester.</p>
        </div>
        <button onClick={() => toast.success('Report downloaded!')} className="btn-secondary btn-sm">
          <Download size={14} /> Export
        </button>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Classes', value: history.length, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Present', value: presentCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Absent', value: absentCount, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show" custom={i} className={`rounded-xl p-3.5 ${bg}`}>
            <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="flex gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(['all', 'present', 'absent'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                filter === f ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input w-auto text-xs">
          <option value="all">All Courses</option>
          <option value="CSE301">Data Structures</option>
          <option value="CSE302">Operating Systems</option>
          <option value="CSE303">DBMS</option>
          <option value="CSE304">Computer Networks</option>
          <option value="CSE305">Software Engineering</option>
        </select>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="card overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {filtered.map((h, i) => (
            <motion.div
              key={`${h.date}-${h.code}`}
              variants={fadeUp} initial="hidden" animate="show" custom={i}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                h.status === 'present'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {h.status === 'present'
                  ? <CheckCircle size={18} className="text-emerald-600" />
                  : <XCircle size={18} className="text-red-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 dark:text-white text-sm">{h.course}</span>
                  <span className="badge badge-gray text-xs font-mono">{h.code}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                  <span>{h.teacher}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{h.time}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xs text-slate-400">{h.date}</div>
                {h.score !== null && (
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                    {Math.round(h.score * 100)}% match
                  </div>
                )}
              </div>

              <span className={`badge flex-shrink-0 ${h.status === 'present' ? 'badge-green' : 'badge-red'}`}>
                {h.status === 'present' ? 'Present' : 'Absent'}
              </span>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">No records found</div>
        )}
      </motion.div>
    </div>
  )
}
