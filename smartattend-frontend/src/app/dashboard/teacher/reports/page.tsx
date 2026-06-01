'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileDown, FileText, Table, Calendar, AlertTriangle, BookOpen, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }),
}

const reportTypes = [
  { id: 'daily', icon: Calendar, title: 'Daily Report', desc: 'Attendance for a specific date across all your courses.', color: 'from-blue-500 to-indigo-600' },
  { id: 'monthly', icon: Table, title: 'Monthly Report', desc: 'Month-wise attendance summary with trends.', color: 'from-indigo-500 to-purple-600' },
  { id: 'semester', icon: BookOpen, title: 'Semester Report', desc: 'Complete semester analytics for all enrolled students.', color: 'from-purple-500 to-pink-600' },
  { id: 'defaulter', icon: AlertTriangle, title: 'Defaulter Report', desc: 'List of students below 75% threshold with details.', color: 'from-amber-500 to-orange-600' },
  { id: 'course', icon: FileText, title: 'Course Report', desc: 'Per-subject attendance breakdown with student list.', color: 'from-emerald-500 to-teal-600' },
  { id: 'raw', icon: Table, title: 'Raw Data Export', desc: 'Full CSV export for custom analysis in Excel.', color: 'from-slate-500 to-slate-700' },
]

export default function TeacherReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState('CSE301')
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')

  const handleDownload = async (id: string) => {
    setDownloading(id)
    await new Promise(r => setTimeout(r, 1800))
    setDownloading(null)
    setDownloaded(prev => [...prev, id])
    toast.success('Report downloaded successfully!')
    setTimeout(() => setDownloaded(prev => prev.filter(d => d !== id)), 3000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Generate and download attendance reports in PDF, Excel, or CSV format.</p>
      </motion.div>

      {/* Controls */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="card p-5">
        <div className="section-title text-base mb-4">Report Settings</div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="label">Course</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input">
              <option value="all">All Courses</option>
              <option value="CSE301">Data Structures</option>
              <option value="CSE302">Operating Systems</option>
              <option value="CSE303">DBMS</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Format</label>
            <div className="flex gap-2">
              {(['pdf', 'excel', 'csv'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFormat(f)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                    selectedFormat === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label">Date Range</label>
            <select className="input">
              <option>This Semester</option>
              <option>This Month</option>
              <option>Last 30 Days</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Report types */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map(({ id, icon: Icon, title, desc, color }, i) => {
          const isDownloading = downloading === id
          const isDone = downloaded.includes(id)
          return (
            <motion.div
              key={id}
              variants={fadeUp} initial="hidden" animate="show" custom={i + 2}
              className="card-hover p-5 flex flex-col gap-4"
            >
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</div>
              </div>
              <button
                onClick={() => handleDownload(id)}
                disabled={isDownloading}
                className={`btn btn-sm w-full justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'btn-secondary'
                }`}
              >
                {isDownloading ? (
                  <><Loader2 size={13} className="animate-spin" /> Generating...</>
                ) : isDone ? (
                  <><Check size={13} /> Downloaded!</>
                ) : (
                  <><FileDown size={13} /> Download {selectedFormat.toUpperCase()}</>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Recent downloads */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8} className="card p-5">
        <div className="section-title text-base mb-4">Recent Downloads</div>
        <div className="space-y-3">
          {[
            { name: 'semester_report_CSE301_2025.pdf', size: '245 KB', time: '2 min ago' },
            { name: 'defaulter_report_may2025.xlsx', size: '38 KB', time: '1 hr ago' },
            { name: 'daily_attendance_20250519.csv', size: '12 KB', time: 'Yesterday' },
          ].map(({ name, size, time }) => (
            <div key={name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                <FileDown size={15} className="text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate font-mono">{name}</div>
                <div className="text-xs text-slate-400">{size} · {time}</div>
              </div>
              <button className="btn-ghost btn-sm text-xs">Re-download</button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
