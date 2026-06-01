'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Eye, Users, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.05 } }),
}

const mockTeachers = [
  { id: 1, name: 'Prof. R. Patil', email: 'rpatil@jspm.edu.in', employee_id: 'EMP001', department: 'CSE', courses: ['DSA', 'OS', 'DBMS'], sessions: 38 },
  { id: 2, name: 'Prof. S. Kulkarni', email: 'skulkarni@jspm.edu.in', employee_id: 'EMP002', department: 'IT', courses: ['CN', 'SE'], sessions: 24 },
  { id: 3, name: 'Prof. A. Deshmukh', email: 'adeshmukh@jspm.edu.in', employee_id: 'EMP003', department: 'CSE', courses: ['Maths', 'TOC'], sessions: 19 },
  { id: 4, name: 'Prof. M. Joshi', email: 'mjoshi@jspm.edu.in', employee_id: 'EMP004', department: 'IT', courses: ['Python', 'ML'], sessions: 31 },
]

export default function AdminTeachersPage() {
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = mockTeachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.employee_id.includes(search) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Teachers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{mockTeachers.length} faculty members registered</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-gradient btn-sm">
          <Plus size={14} /> Add Teacher
        </button>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search teachers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9 max-w-sm"
        />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((teacher, i) => (
          <motion.div key={teacher.id} variants={fadeUp} initial="hidden" animate="show" custom={i} className="card-hover p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {teacher.name.split(' ').slice(1).map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex gap-1">
                <button className="btn-icon btn-ghost p-1.5"><Edit2 size={13} /></button>
                <button className="btn-icon p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{teacher.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">{teacher.email}</div>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span className="badge badge-blue">{teacher.department}</span>
              <span className="font-mono">{teacher.employee_id}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{teacher.courses.length}</div>
                <div className="text-xs text-slate-400">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{teacher.sessions}</div>
                <div className="text-xs text-slate-400">Sessions</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {teacher.courses.map(c => (
                <span key={c} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{c}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-modal"
          >
            <h2 className="section-title text-lg mb-5">Add New Teacher</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="label">Full Name</label>
                  <input className="input" placeholder="Prof. First Last" />
                </div>
                <div className="form-group">
                  <label className="label">Employee ID</label>
                  <input className="input" placeholder="EMP001" />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="teacher@jspm.edu.in" />
              </div>
              <div className="form-group">
                <label className="label">Department</label>
                <select className="input">
                  <option>CSE</option><option>IT</option><option>EXTC</option><option>Mech</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Temporary Password</label>
                <input className="input" type="password" placeholder="Min 6 characters" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => { toast.success('Teacher account created!'); setShowAddModal(false) }} className="btn-gradient flex-1 justify-center">
                Create Teacher
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
