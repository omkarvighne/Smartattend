'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, BookOpen, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.04 } }),
}

const mockCourses = [
  { id: 1, name: 'Data Structures & Algorithms', code: 'CSE301', teacher: 'Prof. R. Patil', department: 'CSE', semester: 3, enrolled: 48, avgAttendance: 79 },
  { id: 2, name: 'Operating Systems', code: 'CSE302', teacher: 'Prof. R. Patil', department: 'CSE', semester: 3, enrolled: 45, avgAttendance: 83 },
  { id: 3, name: 'Database Management Systems', code: 'CSE303', teacher: 'Prof. R. Patil', department: 'CSE', semester: 4, enrolled: 40, avgAttendance: 71 },
  { id: 4, name: 'Computer Networks', code: 'CSE304', teacher: 'Prof. S. Kulkarni', department: 'IT', semester: 5, enrolled: 52, avgAttendance: 74 },
  { id: 5, name: 'Software Engineering', code: 'CSE305', teacher: 'Prof. S. Kulkarni', department: 'CSE', semester: 5, enrolled: 44, avgAttendance: 68 },
  { id: 6, name: 'Machine Learning', code: 'IT401', teacher: 'Prof. M. Joshi', department: 'IT', semester: 7, enrolled: 38, avgAttendance: 86 },
]

export default function AdminCoursesPage() {
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = mockCourses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Courses</h1>
          <p className="text-slate-500 text-sm mt-0.5">{mockCourses.length} active courses across all departments</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-gradient btn-sm">
          <Plus size={14} /> Add Course
        </button>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="input pl-9 max-w-sm" />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Code</th>
                <th>Teacher</th>
                <th>Dept</th>
                <th>Sem</th>
                <th>Enrolled</th>
                <th>Avg Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(course => (
                <tr key={course.id}>
                  <td className="font-medium text-slate-800 dark:text-white">{course.name}</td>
                  <td><span className="font-mono text-xs badge badge-gray">{course.code}</span></td>
                  <td className="text-sm">{course.teacher}</td>
                  <td><span className="badge badge-blue">{course.department}</span></td>
                  <td>Sem {course.semester}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-slate-400" />
                      {course.enrolled}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${course.avgAttendance >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${course.avgAttendance}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${course.avgAttendance >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {course.avgAttendance}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-icon btn-ghost p-1.5"><Edit2 size={13} /></button>
                      <button className="btn-icon p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-modal"
          >
            <h2 className="section-title text-lg mb-5">Add New Course</h2>
            <div className="space-y-4">
              <div className="form-group">
                <label className="label">Course Name</label>
                <input className="input" placeholder="Data Structures & Algorithms" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="label">Course Code</label>
                  <input className="input" placeholder="CSE301" />
                </div>
                <div className="form-group">
                  <label className="label">Semester</label>
                  <select className="input">
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Assign Teacher</label>
                <select className="input">
                  {['Prof. R. Patil', 'Prof. S. Kulkarni', 'Prof. A. Deshmukh', 'Prof. M. Joshi'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Department</label>
                <select className="input">
                  <option>CSE</option><option>IT</option><option>EXTC</option><option>Mech</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => { toast.success('Course created!'); setShowAddModal(false) }} className="btn-gradient flex-1 justify-center">
                Create Course
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
