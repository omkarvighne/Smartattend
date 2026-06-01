'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import {
  Users, QrCode, AlertTriangle, TrendingUp, BookOpen,
  ArrowRight, Plus, BarChart3, Clock
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { teachersApi, attendanceApi } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' } }),
}

// Mock data for charts (replace with real API calls)
const weeklyTrend = [
  { day: 'Mon', attendance: 65 },
  { day: 'Tue', attendance: 72 },
  { day: 'Wed', attendance: 80 },
  { day: 'Thu', attendance: 68 },
  { day: 'Fri', attendance: 75 },
  { day: 'Sat', attendance: 82 },
]

const courseStats = [
  { name: 'DSA', attendance: 79 },
  { name: 'OS', attendance: 83 },
  { name: 'DBMS', attendance: 71 },
  { name: 'CN', attendance: 76 },
]

export default function TeacherDashboard() {
  const user = useAuthStore(s => s.user)

  const { data: coursesData } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => teachersApi.myCourses().then(r => r.data),
    staleTime: 60_000,
  })

  const courses: any[] = coursesData || []

  const stats = [
    { label: 'Active Courses', value: courses.length || 6, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Total Students', value: 142, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Avg Attendance', value: '79%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Defaulters', value: 7, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ]

  const recentSessions = [
    { course: 'Data Structures · SE-B', time: 'Today 10:00 AM', present: 38, total: 48, status: 'closed' },
    { course: 'Operating Systems · SE-A', time: 'Today 11:30 AM', present: 42, total: 45, status: 'closed' },
    { course: 'DBMS · TE-A', time: 'Yesterday 2:00 PM', present: 29, total: 40, status: 'closed' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">
            Good morning, {user?.name?.split(' ').slice(-1)[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Here's what's happening across your courses today.
          </p>
        </div>
        <Link href="/dashboard/teacher/session" className="btn-gradient hidden sm:flex">
          <Plus size={16} /> Start Session
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show" custom={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} mb-1`}>
              <Icon size={20} className={color} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Weekly trend */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title text-base">Weekly Attendance Trend</div>
              <div className="section-sub text-xs">All courses this week</div>
            </div>
            <span className="badge-green text-xs">+4% vs last week</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(v: number) => [`${v}%`, 'Attendance']}
              />
              <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course breakdown */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title text-base">Course Attendance</div>
              <div className="section-sub text-xs">Current semester</div>
            </div>
            <Link href="/dashboard/teacher/analytics" className="btn-ghost btn-sm text-xs">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={courseStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(v: number) => [`${v}%`, 'Attendance']}
              />
              <Bar dataKey="attendance" fill="#6366f1" radius={[6, 6, 0, 0]}
                label={{ position: 'top', fontSize: 10, fill: '#94a3b8', formatter: (v: number) => `${v}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent sessions + quick actions */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Recent sessions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title text-base">Recent Sessions</div>
            <Link href="/dashboard/teacher/records" className="btn-ghost btn-sm text-xs">
              All records <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentSessions.map(({ course, time, present, total, status }) => {
              const pct = Math.round((present / total) * 100)
              return (
                <div key={course} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                    <QrCode size={18} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">{course}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={11} className="text-slate-400" />
                      <span className="text-xs text-slate-400">{time}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{present}/{total}</div>
                    <div className={`text-xs font-semibold ${pct >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{pct}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="card p-5">
          <div className="section-title text-base mb-4">Quick Actions</div>
          <div className="space-y-2">
            {[
              { label: 'Start Attendance', href: '/dashboard/teacher/session', icon: QrCode, primary: true },
              { label: 'View Defaulters', href: '/dashboard/teacher/defaulters', icon: AlertTriangle },
              { label: 'Download Reports', href: '/dashboard/teacher/reports', icon: BarChart3 },
              { label: 'View Analytics', href: '/dashboard/teacher/analytics', icon: TrendingUp },
            ].map(({ label, href, icon: Icon, primary }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${primary
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-300'}`}
              >
                <Icon size={16} />
                {label}
                <ArrowRight size={14} className="ml-auto opacity-60" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
