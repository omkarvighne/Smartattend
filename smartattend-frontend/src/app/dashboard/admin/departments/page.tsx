'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Building2, Users, BookOpen, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.07 } }),
}

const mockDepts = [
  { id: 1, name: 'Computer Science & Engineering', code: 'CSE', students: 420, teachers: 18, courses: 12, color: 'from-indigo-500 to-purple-600' },
  { id: 2, name: 'Information Technology', code: 'IT', students: 380, teachers: 14, courses: 10, color: 'from-blue-500 to-indigo-600' },
  { id: 3, name: 'Electronics & Telecom', code: 'EXTC', students: 310, teachers: 12, courses: 9, color: 'from-emerald-500 to-teal-600' },
  { id: 4, name: 'Mechanical Engineering', code: 'MECH', students: 290, teachers: 16, courses: 11, color: 'from-amber-500 to-orange-600' },
  { id: 5, name: 'Civil Engineering', code: 'CIVIL', students: 240, teachers: 10, courses: 8, color: 'from-rose-500 to-pink-600' },
]

export default function AdminDepartmentsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [deptName, setDeptName] = useState('')
  const [deptCode, setDeptCode] = useState('')

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Departments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{mockDepts.length} departments registered in this institution.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-gradient btn-sm">
          <Plus size={14} /> Add Department
        </button>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDepts.map(({ id, name, code, students, teachers, courses, color }, i) => (
          <motion.div key={id} variants={fadeUp} initial="hidden" animate="show" custom={i} className="card-hover p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm`}>
                {code}
              </div>
              <div className="flex gap-1">
                <button className="btn-icon btn-ghost p-1.5"><Edit2 size={13} /></button>
                <button className="btn-icon p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="font-display font-bold text-slate-900 dark:text-white text-sm leading-snug mb-1">{name}</div>
            <div className="text-xs font-mono text-slate-400 mb-4">{code}</div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
              {[
                { icon: Users, value: students, label: 'Students' },
                { icon: Users, value: teachers, label: 'Teachers' },
                { icon: BookOpen, value: courses, label: 'Courses' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-base font-bold text-slate-800 dark:text-white">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-modal"
          >
            <h2 className="section-title text-lg mb-5">Add Department</h2>
            <div className="space-y-4">
              <div className="form-group">
                <label className="label">Department Name</label>
                <input className="input" placeholder="Computer Science & Engineering" value={deptName} onChange={e => setDeptName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Short Code</label>
                <input className="input" placeholder="CSE" maxLength={10} value={deptCode} onChange={e => setDeptCode(e.target.value.toUpperCase())} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => { toast.success('Department created!'); setShowAddModal(false); setDeptName(''); setDeptCode('') }}
                className="btn-gradient flex-1 justify-center">
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
