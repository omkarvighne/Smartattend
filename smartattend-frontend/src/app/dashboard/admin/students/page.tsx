'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Download, Upload, Filter,
  GraduationCap, CheckCircle, XCircle, Edit2, Trash2, Eye, Loader2
} from 'lucide-react'
import { studentsApi, departmentsApi } from '@/lib/api'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.05 } }),
}

const mockStudents = [
  { id: 1, prn: '202412345', name: 'Omkar Shinde', email: 'omkar@jspm.edu.in', department: 'CSE', semester: 4, face_enrolled: true },
  { id: 2, prn: '202412346', name: 'Aryan Mehta', email: 'aryan@jspm.edu.in', department: 'CSE', semester: 4, face_enrolled: true },
  { id: 3, prn: '202412347', name: 'Priya Joshi', email: 'priya@jspm.edu.in', department: 'IT', semester: 2, face_enrolled: true },
  { id: 4, prn: '202412348', name: 'Ravi Kumar', email: 'ravi@jspm.edu.in', department: 'CSE', semester: 4, face_enrolled: false },
  { id: 5, prn: '202412349', name: 'Sneha Patil', email: 'sneha@jspm.edu.in', department: 'CSE', semester: 4, face_enrolled: true },
]

const defaultForm = { name: '', email: '', password: '', prn: '', department_id: 1, semester: 3 }

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('')
  const [semFilter, setSemFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const queryClient = useQueryClient()

  // Fetch departments for the dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.list().then(r => r.data).catch(() => [
      { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
      { id: 2, name: 'Information Technology', code: 'IT' },
    ]),
  })

  // Fetch real students list
  const { data: studentsData = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.list().then(r => r.data).catch(() => mockStudents),
  })

  // Create student mutation — hits the real backend POST /students
  const createMutation = useMutation({
    mutationFn: () => studentsApi.create({
      name: form.name,
      email: form.email,
      password: form.password,
      prn: form.prn,
      department_id: Number(form.department_id),
      semester: Number(form.semester),
    }),
    onSuccess: () => {
      toast.success(`Student "${form.name}" created! They can now log in with their email and password.`)
      setShowAddModal(false)
      setForm(defaultForm)
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.detail || 'Failed to create student'
      toast.error(msg)
    },
  })

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password || !form.prn) {
      toast.error('Please fill in all required fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    createMutation.mutate()
  }

  // Show real students if loaded, else fallback to mock
  const allStudents: any[] = studentsData.length > 0 ? studentsData.map((s: any) => ({
    id: s.id,
    prn: s.prn,
    name: s.user?.name || s.name,
    email: s.user?.email || s.email,
    department: s.department?.code || 'CSE',
    semester: s.semester,
    face_enrolled: s.face_enrolled,
  })) : mockStudents

  const filtered = allStudents.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.prn?.includes(search) || s.email?.toLowerCase().includes(search.toLowerCase())
    const matchSem = semFilter === 'all' || s.semester?.toString() === semFilter
    return matchSearch && matchSem
  })

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Students</h1>
          <p className="text-slate-500 text-sm mt-0.5">{allStudents.length} students registered · {allStudents.filter(s => !s.face_enrolled).length} face enrollment pending</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary btn-sm"><Upload size={14} /> Bulk Upload</button>
          <button className="btn-secondary btn-sm"><Download size={14} /> Export</button>
          <button onClick={() => setShowAddModal(true)} className="btn-gradient btn-sm">
            <Plus size={14} /> Add Student
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search students..." value={search}
            onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <select value={semFilter} onChange={e => setSemFilter(e.target.value)} className="input w-auto">
          <option value="all">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', value: allStudents.length, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Face Enrolled', value: allStudents.filter(s => s.face_enrolled).length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Pending Enrollment', value: allStudents.filter(s => !s.face_enrolled).length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Departments', value: new Set(allStudents.map(s => s.department)).size, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(({ label, value, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show" custom={i + 2} className={`rounded-xl p-3 ${bg}`}>
            <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th><th>PRN</th><th>Department</th><th>Semester</th><th>Face Enrolled</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <tr key={student.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-white">{student.name}</div>
                        <div className="text-xs text-slate-400">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs text-slate-500">{student.prn}</span></td>
                  <td><span className="badge badge-blue">{student.department}</span></td>
                  <td>Sem {student.semester}</td>
                  <td>
                    {student.face_enrolled
                      ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle size={13} /> Enrolled</span>
                      : <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold"><XCircle size={13} /> Pending</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-icon btn-ghost p-1.5"><Eye size={14} /></button>
                      <button className="btn-icon btn-ghost p-1.5"><Edit2 size={14} /></button>
                      <button className="btn-icon p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <GraduationCap size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No students found</p>
          </div>
        )}
      </motion.div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-modal"
          >
            <h2 className="section-title text-lg mb-1">Add New Student</h2>
            <p className="text-xs text-slate-400 mb-5">Student will be able to log in immediately with these credentials.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="Omkar Shinde"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">PRN *</label>
                  <input className="input" placeholder="202412345"
                    value={form.prn} onChange={e => setForm(f => ({ ...f, prn: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Email *</label>
                <input className="input" type="email" placeholder="student@jspm.edu.in"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="label">Password * (min 6 chars)</label>
                <input className="input" type="password" placeholder="Set a login password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <p className="text-xs text-slate-400 mt-1">Share this with the student so they can log in.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="label">Department</label>
                  <select className="input" value={form.department_id}
                    onChange={e => setForm(f => ({ ...f, department_id: Number(e.target.value) }))}>
                    {departments.length > 0
                      ? departments.map((d: any) => <option key={d.id} value={d.id}>{d.code} – {d.name}</option>)
                      : <><option value={1}>CSE</option><option value={2}>IT</option></>}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Semester</label>
                  <select className="input" value={form.semester}
                    onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) }))}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setForm(defaultForm) }}
                className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSubmit} disabled={createMutation.isPending}
                className="btn-gradient flex-1 justify-center">
                {createMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Create Student'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
