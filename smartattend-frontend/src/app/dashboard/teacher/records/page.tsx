'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, ChevronDown, CheckCircle, XCircle, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.05 } }),
}

const mockRecords = [
  { name: 'Omkar Shinde', prn: '202412345', sessions: 38, present: 34, pct: 89.5 },
  { name: 'Aryan Mehta', prn: '202412346', sessions: 38, present: 36, pct: 94.7 },
  { name: 'Priya Joshi', prn: '202412347', sessions: 38, present: 30, pct: 78.9 },
  { name: 'Ravi Kumar', prn: '202412348', sessions: 38, present: 27, pct: 71.1 },
  { name: 'Sneha Patil', prn: '202412349', sessions: 38, present: 26, pct: 68.4 },
  { name: 'Karan Nair', prn: '202412350', sessions: 38, present: 33, pct: 86.8 },
  { name: 'Meena Rao', prn: '202412351', sessions: 38, present: 29, pct: 76.3 },
  { name: 'Amit Shah', prn: '202412352', sessions: 38, present: 35, pct: 92.1 },
]

export default function TeacherRecordsPage() {
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('CSE301')

  const filtered = mockRecords.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.prn.includes(search)
  )

  const stats = {
    total: filtered.length,
    defaulters: filtered.filter(r => r.pct < 75).length,
    avgPct: filtered.length ? (filtered.reduce((a, r) => a + r.pct, 0) / filtered.length).toFixed(1) : '0',
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Attendance Records</h1>
          <p className="text-slate-500 text-sm mt-0.5">Full semester attendance for all enrolled students.</p>
        </div>
        <button onClick={() => toast.success('Report downloaded!')} className="btn-secondary btn-sm">
          <Download size={14} /> Export Excel
        </button>
      </motion.div>

      {/* Course selector */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="flex gap-3 flex-wrap">
        <div className="relative">
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input appearance-none pr-8 w-auto">
            <option value="CSE301">Data Structures · SE-B</option>
            <option value="CSE302">Operating Systems · SE-A</option>
            <option value="CSE303">DBMS · TE-A</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="input pl-9 w-64" />
        </div>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Students', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Avg Attendance', value: `${stats.avgPct}%`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Defaulters', value: stats.defaulters, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show" custom={i + 2} className={`rounded-xl p-3.5 ${bg}`}>
            <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>PRN</th>
                <th>Sessions</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.prn}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {r.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-white text-sm">{r.name}</span>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs text-slate-400">{r.prn}</span></td>
                  <td className="text-sm">{r.sessions}</td>
                  <td>
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                      <CheckCircle size={13} /> {r.present}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <XCircle size={13} /> {r.sessions - r.present}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${r.pct >= 80 ? 'bg-emerald-500' : r.pct >= 75 ? 'bg-indigo-500' : 'bg-red-500'}`}
                          style={{ width: `${r.pct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${r.pct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{r.pct}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${r.pct >= 75 ? 'badge-green' : 'badge-red'}`}>
                      {r.pct >= 75 ? 'Regular' : 'Defaulter'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
