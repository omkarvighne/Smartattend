'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Shield, Bell, Database, Palette, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.07 } }),
}

export default function AdminSettingsPage() {
  const [threshold, setThreshold] = useState(75)
  const [qrExpiry, setQrExpiry] = useState(30)
  const [sessionDuration, setSessionDuration] = useState(30)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [autoFlag, setAutoFlag] = useState(true)

  const sections = [
    {
      icon: Shield,
      title: 'Attendance Rules',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      content: (
        <div className="space-y-5">
          <div className="form-group">
            <label className="label">Defaulter Threshold (%)</label>
            <div className="flex items-center gap-4">
              <input type="range" min={50} max={90} value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="flex-1 accent-indigo-600" />
              <span className="w-14 text-center font-bold text-indigo-600 text-sm bg-indigo-50 dark:bg-indigo-900/20 rounded-lg py-1">{threshold}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Students below this threshold are flagged as defaulters.</p>
          </div>
          <div className="form-group">
            <label className="label">QR Code Expiry (seconds)</label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map(v => (
                <button key={v} onClick={() => setQrExpiry(v)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${qrExpiry === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {v}s
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label">Default Session Duration (minutes)</label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map(v => (
                <button key={v} onClick={() => setSessionDuration(v)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${sessionDuration === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {v}m
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Bell,
      title: 'Notifications',
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      content: (
        <div className="space-y-4">
          {[
            { label: 'Email notifications for defaulters', desc: 'Send automated emails when students fall below threshold', state: emailNotifications, set: setEmailNotifications },
            { label: 'Auto-flag defaulters', desc: 'Automatically mark students as defaulters at semester end', state: autoFlag, set: setAutoFlag },
          ].map(({ label, desc, state, set }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-white">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
              </div>
              <button
                onClick={() => set(!state)}
                className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${state ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${state ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: Database,
      title: 'Data & Privacy',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      content: (
        <div className="space-y-3 text-sm">
          {[
            { label: 'Face embedding model', value: 'DeepFace ArcFace' },
            { label: 'Image storage', value: 'Embeddings only (no raw photos)' },
            { label: 'Data encryption', value: 'AES-256' },
            { label: 'Token expiry', value: '60 min access · 7 day refresh' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
              <span className="text-slate-500 dark:text-slate-400">{label}</span>
              <span className="font-medium text-slate-800 dark:text-white text-xs bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">{value}</span>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure platform-wide settings for your institution.</p>
      </motion.div>

      {sections.map(({ icon: Icon, title, color, bg, content }, i) => (
        <motion.div key={title} variants={fadeUp} initial="hidden" animate="show" custom={i} className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <div className="section-title text-base">{title}</div>
          </div>
          {content}
        </motion.div>
      ))}

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
        <button
          onClick={() => toast.success('Settings saved successfully!')}
          className="btn-gradient btn-lg w-full justify-center"
        >
          <Save size={18} /> Save Settings
        </button>
      </motion.div>
    </div>
  )
}
