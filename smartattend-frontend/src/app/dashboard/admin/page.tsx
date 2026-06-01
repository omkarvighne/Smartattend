'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  GraduationCap, Users, BookOpen, Building2,
  TrendingUp, AlertTriangle, ArrowRight, Activity,
  CheckCircle, BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06 } }),
}

const weeklyData = [
  { day: 'Mon', sessions: 12, students: 380 },
  { day: 'Tue', sessions: 18, students: 520 },
  { day: 'Wed', sessions: 22, students: 640 },
  { day: 'Thu', sessions: 15, students: 430 },
  { day: 'Fri', sessions: 20, students: 580 },
  { day: 'Sat', sessions: 8, students: 210 },
]

const institutions = [
  { name: 'JSPM University', students: 1420, teachers: 82, avgAttendance: 79, plan: 'Pro' },
  { name: 'MIT College', students: 890, teachers: 54, avgAttendance: 83, plan: 'Pro' },
  { name: 'Symbiosis', students: 380, teachers: 22, avgAttendance: 76, plan: 'Starter' },
  { name: 'COEP', students: 151, teachers: 6, avgAttendance: 81, plan: 'Trial' },
]

const recentActivity = [
  { text: 'New student registered — Omkar Shinde · JSPM', time: '2 min ago', type: 'student' },
  { text: 'Attendance session started — DSA · SE-B', time: '8 min ago', type: 'session' },
  { text: 'Defaulter report exported — Prof. R. Patil', time: '25 min ago', type: 'report' },
  { text: 'New teacher account created — Prof. S. Kulkarni', time: '1 hr ago', type: 'teacher' },
  { text: 'Course created — Computer Networks · CSE304', time: '2 hr ago', type: 'course' },
]

const activityColors: Record<string, string> = {
  student: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  session: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  report: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  teacher: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  course: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
}

const activityIcons: Record<string, any> = {
  student: GraduationCap,
  session: Activity,
  report: BarChart3,
  teacher: Users,
  course: BookOpen,
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Platform-wide overview across all institutions.</p>
        </div>
        <Link href="/dashboard/admin/students" className="btn-gradient hidden sm:flex">
          <Users size={16} /> Manage Users
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Institutions', value: '4', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Total Students', value: '2,841', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Teachers', value: '164', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Sessions Today', value: '38', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show" custom={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="card p-5">
          <div className="section-title text-base mb-1">Weekly Sessions</div>
          <div className="section-sub text-xs mb-4">Across all institutions</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="card p-5">
          <div className="section-title text-base mb-1">Students Active</div>
          <div className="section-sub text-xs mb-4">Daily attendance volume</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={28}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Bar dataKey="students" fill="#d946ef" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Institutions table + activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title text-base">Institutions</div>
            <Link href="/dashboard/admin/institutions" className="btn-ghost btn-sm text-xs">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Institution</th>
                  <th>Students</th>
                  <th>Teachers</th>
                  <th>Avg Attendance</th>
                  <th>Plan</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map(({ name, students, teachers, avgAttendance, plan }) => (
                  <tr key={name}>
                    <td className="font-medium text-slate-800 dark:text-white">{name}</td>
                    <td>{students.toLocaleString()}</td>
                    <td>{teachers}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${avgAttendance}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{avgAttendance}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge text-xs ${plan === 'Pro' ? 'badge-purple' : plan === 'Trial' ? 'badge-amber' : 'badge-gray'}`}>
                        {plan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="card p-5">
          <div className="section-title text-base mb-4">Recent Activity</div>
          <div className="space-y-3">
            {recentActivity.map(({ text, time, type }) => {
              const Icon = activityIcons[type]
              return (
                <div key={text} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${activityColors[type]}`}>
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{text}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Students', href: '/dashboard/admin/students', icon: GraduationCap, color: 'from-emerald-500 to-teal-600' },
          { label: 'Manage Teachers', href: '/dashboard/admin/teachers', icon: Users, color: 'from-blue-500 to-indigo-600' },
          { label: 'Manage Courses', href: '/dashboard/admin/courses', icon: BookOpen, color: 'from-purple-500 to-pink-600' },
          { label: 'View Analytics', href: '/dashboard/admin/analytics', icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={label} href={href}
            className="card-hover p-4 flex flex-col items-center gap-3 text-center group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <Icon size={18} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
