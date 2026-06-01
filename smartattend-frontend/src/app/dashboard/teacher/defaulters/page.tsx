'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Download, Mail, Filter, ChevronDown, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.05 } }),
}

const mockDefaulters = [
  { id: 1, name: 'Ravi Kumar', prn: '202412348', course: 'Data Structures', code: 'CSE301', attended: 27, total: 38, pct: 71 },
  { id: 2, name: 'Sneha Patil', prn: '202412349', course: 'DBMS', code: 'CSE303', attended: 26, total: 38, pct: 68 },
  { id: 3, name: 'Karan Nair', prn: '202412350', course: 'Operating Systems', code: 'CSE302', attended: 24, total: 38, pct: 63 },
  { id: 4, name: 'Meena Rao', prn: '202412351', course: 'Software Engineering', code: 'CSE305', attended: 23, total: 38, pct: 61 },
  { id: 5, name: 'Ravi Kumar', prn: '202412348', course: 'DBMS', code: 'CSE303', attended: 28, total: 38, pct: 74 },
]

export default function DefaultersPage() {
  const [courseFilter, setCourseFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = mockDefaulters.filter(d => {
    const matchCourse = courseFilter === 'all' || d.code === courseFilter
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.prn.includes(search)
    return matchCourse && matchSearch
  })

  const classesNeeded = (pct: number, attended: number, total: number) => {
    // Calculate classes needed to reach 75%
    let x = 0
    while ((attended + x) / (total + x) < 0.75) x++
    return x
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Defaulters</h1>
          <p className="text-slate-500 text-sm mt-0.5">Students with attendance below the 75% threshold.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success('Report downloaded!')} className="btn-secondary btn-sm">
            <Download size={14} /> Export List
          </button>
        </div>
      </motion.div>

      {/* Alert banner */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
        className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl"
      >
        <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
        <div>
          <div className="font-semibold text-red-700 dark:text-red-400 text-sm">{mockDefaulters.length} defaulter records found</div>
          <div className="text-red-600 dark:text-red-300 text-xs mt-0.5">
            These students need to attend consecutive classes to recover their attendance.
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or PRN..." className="input pl-9" />
        </div>
        <div className="relative">
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input appearance-none pr-8 w-auto">
            <option value="all">All Courses</option>
            <option value="CSE301">Data Structures</option>
            <option value="CSE302">Operating Systems</option>
            <option value="CSE303">DBMS</option>
            <option value="CSE305">Software Engineering</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>PRN</th>
                <th>Course</th>
                <th>Attended</th>
                <th>Attendance %</th>
                <th>Classes Needed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const needed = classesNeeded(d.pct, d.attended, d.total)
                const severity = d.pct < 65 ? 'danger' : 'warning'
                return (
                  <tr key={`${d.id}-${d.code}`}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-xs font-bold">
                          {d.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-white text-sm">{d.name}</span>
                      </div>
                    </td>
                    <td><span className="font-mono text-xs text-slate-500">{d.prn}</span></td>
                    <td>
                      <div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">{d.course}</div>
                        <div className="text-xs text-slate-400 font-mono">{d.code}</div>
                      </div>
                    </td>
                    <td className="text-sm">{d.attended}/{d.total}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${severity === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`}
                            style={{ width: `${d.pct}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${severity === 'danger' ? 'text-red-600' : 'text-amber-600'}`}>{d.pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${needed > 10 ? 'badge-red' : 'badge-amber'}`}>
                        {needed} more classes
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toast.success(`Notification sent to ${d.name}`)}
                        className="btn-secondary btn-sm text-xs"
                      >
                        <Mail size={12} /> Notify
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <AlertTriangle size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No defaulters found</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
