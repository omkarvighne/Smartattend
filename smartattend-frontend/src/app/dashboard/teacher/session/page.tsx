'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { QrCode, PlayCircle, StopCircle, RefreshCw, Users, Clock, CheckCircle, ChevronDown } from 'lucide-react'
import { teachersApi, attendanceApi } from '@/lib/api'
import { QRResponse } from '@/types'
import toast from 'react-hot-toast'

export default function StartSessionPage() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
  const [duration, setDuration] = useState(30)
  const [activeSession, setActiveSession] = useState<QRResponse | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [presentCount, setPresentCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: courses = [] } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => teachersApi.myCourses().then(r => r.data),
  })

  // QR refresh countdown
  useEffect(() => {
    if (!activeSession) return
    setTimeLeft(30)
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { refreshQR(); return 30 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [activeSession?.session_id])

  // Session duration counter
  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => setSessionTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [activeSession?.session_id])

  // Fake live attendance updates (replace with WebSocket in production)
  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => {
      if (Math.random() > 0.7) setPresentCount(c => Math.min(c + 1, 48))
    }, 3000)
    return () => clearInterval(interval)
  }, [activeSession?.session_id])

  const startMutation = useMutation({
    mutationFn: () => attendanceApi.createSession(selectedCourse!, duration),
    onSuccess: ({ data }) => {
      setActiveSession(data)
      setPresentCount(0)
      setSessionTimer(0)
      toast.success('Session started! QR is live.')
    },
    onError: () => toast.error('Failed to start session. Check your course selection.'),
  })

  const closeMutation = useMutation({
    mutationFn: () => attendanceApi.closeSession(activeSession!.session_id),
    onSuccess: () => {
      setActiveSession(null)
      toast.success(`Session closed. ${presentCount} students marked present.`)
    },
    onError: () => toast.error('Failed to close session'),
  })

  const refreshQR = useCallback(async () => {
    if (!activeSession) return
    setIsRefreshing(true)
    try {
      const { data } = await attendanceApi.refreshQR(activeSession.session_id)
      setActiveSession(data)
    } catch { }
    setTimeout(() => setIsRefreshing(false), 400)
  }, [activeSession])

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const totalStudents = 48 // would come from course enrollment count
  const pct = Math.round((presentCount / totalStudents) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Start Attendance Session</h1>
        <p className="text-slate-500 text-sm mt-0.5">Generate a QR code for your class. It rotates every 30 seconds automatically.</p>
      </div>

      <AnimatePresence mode="wait">
        {!activeSession ? (

          /* ── Setup form ──────────────────────────── */
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="card p-6"
          >
            <h2 className="section-title text-lg mb-5">Configure Session</h2>

            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <div className="form-group">
                <label className="label">Select Course</label>
                <div className="relative">
                  <select
                    value={selectedCourse || ''}
                    onChange={e => setSelectedCourse(Number(e.target.value))}
                    className="input appearance-none pr-8"
                  >
                    <option value="">Choose a course...</option>
                    {courses.length > 0 ? courses.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} · {c.code}</option>
                    )) : (
                      <>
                        <option value="1">Data Structures · CSE301</option>
                        <option value="2">Operating Systems · CSE302</option>
                        <option value="3">DBMS · CSE303</option>
                      </>
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Session Duration</label>
                <div className="relative">
                  <select
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="input appearance-none pr-8"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mb-6 text-sm text-indigo-700 dark:text-indigo-300">
              <QrCode size={18} />
              <span>QR code will auto-rotate every 30 seconds to prevent sharing. Students must scan in real time.</span>
            </div>

            <button
              onClick={() => startMutation.mutate()}
              disabled={!selectedCourse || startMutation.isPending}
              className="btn-gradient btn-lg w-full sm:w-auto justify-center"
            >
              {startMutation.isPending ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <PlayCircle size={18} />
              )}
              Generate QR & Start Session
            </button>
          </motion.div>

        ) : (

          /* ── Live session ─────────────────────────── */
          <motion.div
            key="live"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Status bar */}
            <div className="card p-4 flex items-center gap-4 border-l-4 border-emerald-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Session Live</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock size={14} />
                <span>{formatTime(sessionTimer)} elapsed</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => refreshQR()} className="btn-secondary btn-sm">
                  <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} /> Refresh QR
                </button>
                <button
                  onClick={() => closeMutation.mutate()}
                  disabled={closeMutation.isPending}
                  className="btn-danger btn-sm"
                >
                  <StopCircle size={13} /> End Session
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">

              {/* QR Code display */}
              <div className="card p-6 text-center">
                <div className="text-sm font-semibold text-slate-500 mb-4">Show this on your projector / screen</div>

                <motion.div
                  key={activeSession.qr_token.slice(-8)}
                  animate={{ opacity: isRefreshing ? [1, 0.3, 1] : 1 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block relative mb-4"
                >
                  {activeSession.qr_image_b64 ? (
                    <img
                      src={`data:image/png;base64,${activeSession.qr_image_b64}`}
                      alt="Attendance QR code"
                      className="w-52 h-52 rounded-2xl border-4 border-indigo-100 dark:border-indigo-900"
                    />
                  ) : (
                    <div className="w-52 h-52 rounded-2xl border-4 border-indigo-100 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                      <QrCode size={64} className="text-indigo-400" />
                    </div>
                  )}
                  {/* Timer ring */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                    ↻ {timeLeft}s
                  </div>
                </motion.div>

                <div className="text-xs text-slate-400 mt-4">
                  QR refreshes automatically · Students use any camera
                </div>
              </div>

              {/* Live attendance */}
              <div className="card p-6">
                <div className="section-title text-base mb-5">Live Attendance</div>

                {/* Big counter */}
                <div className="text-center mb-6">
                  <motion.div
                    key={presentCount}
                    initial={{ scale: 1.2, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-display font-black text-slate-900 dark:text-white"
                  >
                    {presentCount}
                  </motion.div>
                  <div className="text-slate-400 text-sm">of {totalStudents} students</div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Attendance rate</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className={`progress-fill ${pct >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Status rows */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle size={14} /> Present
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">{presentCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={14} /> Remaining
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">{totalStudents - presentCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-indigo-500">
                      <Clock size={14} /> Session time left
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">{formatTime(duration * 60 - sessionTimer)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
