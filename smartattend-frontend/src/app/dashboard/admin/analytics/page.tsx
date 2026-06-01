'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Activity, Building2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line, Legend,
  PieChart, Pie, Cell
} from 'recharts'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
}

const monthlyGrowth = [
  { month: 'Jan', students: 1820, sessions: 120, attendance: 74 },
  { month: 'Feb', students: 2010, sessions: 180, attendance: 76 },
  { month: 'Mar', students: 2200, sessions: 210, attendance: 78 },
  { month: 'Apr', students: 2450, sessions: 250, attendance: 77 },
  { month: 'May', students: 2841, sessions: 310, attendance: 80 },
]

const institutionData = [
  { name: 'JSPM', attendance: 79, students: 1420 },
  { name: 'MIT', attendance: 83, students: 890 },
  { name: 'Symbiosis', attendance: 76, students: 380 },
  { name: 'COEP', attendance: 81, students: 151 },
]

const roleDistribution = [
  { name: 'Students', value: 2841, color: '#6366f1' },
  { name: 'Teachers', value: 164, color: '#d946ef' },
  { name: 'Admins', value: 12, color: '#10b981' },
]

const weeklyActivity = [
  { day: 'Mon', sessions: 42, verifications: 1280 },
  { day: 'Tue', sessions: 58, verifications: 1720 },
  { day: 'Wed', sessions: 71, verifications: 2100 },
  { day: 'Thu', sessions: 49, verifications: 1450 },
  { day: 'Fri', sessions: 63, verifications: 1890 },
  { day: 'Sat', sessions: 28, verifications: 820 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
        <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-500">{p.name}:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Platform Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform-wide metrics across all institutions.</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '3,017', delta: '+12% this month', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Sessions This Month', value: '310', delta: '+24% vs last month', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Platform Avg Attendance', value: '80%', delta: '+3% this semester', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Active Institutions', value: '4', delta: '1 trial expiring soon', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(({ label, value, delta, icon: Icon, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show" custom={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{delta}</div>
          </motion.div>
        ))}
      </div>

      {/* Growth chart */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-title text-base">Platform Growth</div>
            <div className="section-sub text-xs">Students registered & sessions run over time</div>
          </div>
          <span className="badge-green text-xs">+56% YTD</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyGrowth} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="studGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="students" name="Students" stroke="#6366f1" strokeWidth={2} fill="url(#studGrad)" dot={{ fill: '#6366f1', r: 3 }} />
            <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#d946ef" strokeWidth={2} fill="url(#sessGrad)" dot={{ fill: '#d946ef', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 3-column row */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Weekly activity */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="card p-5 lg:col-span-2">
          <div className="section-title text-base mb-1">Weekly Activity</div>
          <div className="section-sub text-xs mb-4">Sessions run & face verifications performed</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyActivity} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barSize={20} barGap={4}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="sessions" name="Sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="verifications" name="Verifications" fill="#d946ef" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User distribution donut */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} className="card p-5">
          <div className="section-title text-base mb-1">User Breakdown</div>
          <div className="section-sub text-xs mb-4">Platform user distribution</div>
          <div className="flex justify-center">
            <PieChart width={160} height={160}>
              <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
                {roleDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2 mt-2">
            {roleDistribution.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-slate-600 dark:text-slate-400">{name}</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Institution attendance comparison */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="card p-5">
        <div className="section-title text-base mb-4">Institution Attendance Comparison</div>
        <div className="space-y-5">
          {institutionData.map(({ name, attendance, students }, i) => (
            <div key={name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-white">{name}</div>
                    <div className="text-xs text-slate-400">{students.toLocaleString()} students</div>
                  </div>
                </div>
                <span className={`text-sm font-bold ${attendance >= 80 ? 'text-emerald-600' : attendance >= 75 ? 'text-indigo-600' : 'text-amber-600'}`}>
                  {attendance}%
                </span>
              </div>
              <div className="progress-bar h-3">
                <motion.div
                  className={`progress-fill ${attendance >= 80 ? 'bg-emerald-500' : attendance >= 75 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                  initial={{ width: 0 }} animate={{ width: `${attendance}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
