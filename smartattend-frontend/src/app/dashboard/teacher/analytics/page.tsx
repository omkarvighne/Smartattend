'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Award } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Legend, AreaChart, Area
} from 'recharts'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
}

const monthlyData = [
  { month: 'Jan', avg: 72 }, { month: 'Feb', avg: 78 }, { month: 'Mar', avg: 75 },
  { month: 'Apr', avg: 82 }, { month: 'May', avg: 79 }, { month: 'Jun', avg: 84 },
]

const courseComparison = [
  { course: 'DSA', avg: 79, enrolled: 48 },
  { course: 'OS', avg: 83, enrolled: 45 },
  { course: 'DBMS', avg: 71, enrolled: 40 },
  { course: 'CN', avg: 76, enrolled: 52 },
  { course: 'SE', avg: 68, enrolled: 44 },
]

const dayWise = [
  { day: 'Mon', attendance: 68 }, { day: 'Tue', attendance: 75 },
  { day: 'Wed', attendance: 82 }, { day: 'Thu', attendance: 71 },
  { day: 'Fri', attendance: 77 }, { day: 'Sat', attendance: 60 },
]

const distributionData = [
  { range: '90-100%', count: 28 }, { range: '75-90%', count: 52 },
  { range: '60-75%', count: 38 }, { range: 'Below 60%', count: 24 },
]

export default function TeacherAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Attendance trends and insights across all your courses.</p>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Highest Course', value: 'OS', sub: '83% avg', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Lowest Course', value: 'SE', sub: '68% avg', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Best Day', value: 'Wednesday', sub: '82% avg', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Total Students', value: '229', sub: 'across 5 courses', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(({ label, value, sub, icon: Icon, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show" custom={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div className="text-xs text-slate-400">{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Monthly trend + Day-wise */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="card p-5">
          <div className="section-title text-base mb-1">Monthly Trend</div>
          <div className="section-sub text-xs mb-4">Average attendance across all courses</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(v: number) => [`${v}%`, 'Avg attendance']} />
              <Area type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: '#6366f1', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="card p-5">
          <div className="section-title text-base mb-1">Day-wise Attendance</div>
          <div className="section-sub text-xs mb-4">Which days students show up most</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayWise} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={30}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(v: number) => [`${v}%`, 'Attendance']} />
              <Bar dataKey="attendance" radius={[6, 6, 0, 0]}
                fill="#6366f1"
                label={{ position: 'top', fontSize: 10, fill: '#94a3b8', formatter: (v: number) => `${v}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Course comparison + distribution */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} className="card p-5">
          <div className="section-title text-base mb-4">Course Comparison</div>
          <div className="space-y-4">
            {courseComparison.map(({ course, avg, enrolled }) => (
              <div key={course}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{course}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{enrolled} students</span>
                    <span className={`text-sm font-bold ${avg >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{avg}%</span>
                  </div>
                </div>
                <div className="progress-bar h-2.5">
                  <motion.div
                    className={`progress-fill ${avg >= 80 ? 'bg-emerald-500' : avg >= 75 ? 'bg-indigo-500' : avg >= 65 ? 'bg-amber-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }} animate={{ width: `${avg}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* 75% marker indicator */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-0.5 bg-red-300" style={{ borderStyle: 'dashed' }} />
            <span>75% minimum threshold</span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="card p-5">
          <div className="section-title text-base mb-4">Attendance Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distributionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={40}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(v: number) => [v, 'Students']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Bar key={entry.range} fill={['#10b981', '#6366f1', '#f59e0b', '#ef4444'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: '90-100% (Excellent)', color: 'bg-emerald-500', count: 28 },
              { label: '75-90% (Good)', color: 'bg-indigo-500', count: 52 },
              { label: '60-75% (Warning)', color: 'bg-amber-500', count: 38 },
              { label: 'Below 60% (Critical)', color: 'bg-red-500', count: 24 },
            ].map(({ label, color, count }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                <span>{label}: <strong className="text-slate-700 dark:text-slate-300">{count}</strong></span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
