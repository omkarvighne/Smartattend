'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, TrendingDown, TrendingUp, XCircle } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.07 } }),
}

const alerts = [
  {
    type: 'danger',
    icon: XCircle,
    title: 'Critical: Software Engineering',
    message: 'Your attendance is 68.4% — critically below the 75% threshold. You need to attend the next 10 classes consecutively to recover.',
    course: 'CSE305',
    pct: 68.4,
  },
  {
    type: 'warning',
    icon: AlertTriangle,
    title: 'Warning: Computer Networks',
    message: 'Your attendance is 71.1%, which is below the minimum threshold. Attend 3 more consecutive classes to recover.',
    course: 'CSE304',
    pct: 71.1,
  },
  {
    type: 'info',
    icon: Info,
    title: 'Heads up: DBMS',
    message: 'Your attendance in DBMS is 76.3% — just above the threshold. Missing 1 more class could put you at risk.',
    course: 'CSE303',
    pct: 76.3,
  },
  {
    type: 'success',
    icon: TrendingUp,
    title: 'Great job: Data Structures',
    message: 'Your attendance in Data Structures is 89.5% — well above the threshold. Keep it up!',
    course: 'CSE301',
    pct: 89.5,
  },
  {
    type: 'success',
    icon: CheckCircle,
    title: 'Safe: Operating Systems',
    message: 'Your attendance in Operating Systems is 81.6%. You can afford to miss 2 more classes before reaching risk zone.',
    course: 'CSE302',
    pct: 81.6,
  },
]

const styles = {
  danger:  { card: 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/50', icon: 'text-red-500 bg-red-100 dark:bg-red-900/30', title: 'text-red-800 dark:text-red-300', text: 'text-red-700 dark:text-red-400' },
  warning: { card: 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/50', icon: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30', title: 'text-amber-800 dark:text-amber-300', text: 'text-amber-700 dark:text-amber-400' },
  info:    { card: 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800/50', icon: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', title: 'text-blue-800 dark:text-blue-300', text: 'text-blue-700 dark:text-blue-400' },
  success: { card: 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800/50', icon: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', title: 'text-emerald-800 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-400' },
}

export default function StudentAlertsPage() {
  const danger = alerts.filter(a => a.type === 'danger').length
  const warning = alerts.filter(a => a.type === 'warning').length

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Attendance Alerts</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {danger > 0 ? `${danger} critical issue${danger > 1 ? 's' : ''} require your attention.` : 'No critical issues. Stay consistent!'}
        </p>
      </motion.div>

      {/* Summary pills */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="flex gap-2 flex-wrap">
        <span className="badge badge-red">{danger} Critical</span>
        <span className="badge badge-amber">{warning} Warning</span>
        <span className="badge badge-green">{alerts.filter(a => a.type === 'success').length} Safe</span>
      </motion.div>

      <div className="space-y-3">
        {alerts.map(({ type, icon: Icon, title, message, course, pct }, i) => {
          const s = styles[type as keyof typeof styles]
          return (
            <motion.div
              key={course}
              variants={fadeUp} initial="hidden" animate="show" custom={i + 2}
              className={`rounded-2xl border p-4 flex gap-4 ${s.card}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.icon}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm mb-1 ${s.title}`}>{title}</div>
                <div className={`text-xs leading-relaxed ${s.text}`}>{message}</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${type === 'danger' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${s.title}`}>{pct}%</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Tips */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="card p-5">
        <div className="section-title text-base mb-3">Tips to improve attendance</div>
        <div className="space-y-2">
          {[
            'Set phone reminders 30 minutes before each class',
            'Use SmartAttend to mark attendance quickly — it takes under 5 seconds',
            'Track your attendance weekly, not just before exams',
            'If you miss a class, plan to attend the next 3-4 without fail',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              {tip}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
