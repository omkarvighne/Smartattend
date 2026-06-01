'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, QrCode, ClipboardList, BarChart3, AlertTriangle,
  FileDown, Users, BookOpen, GraduationCap, ScanFace, Bell,
  Settings, LogOut, Menu, ChevronRight, Building2, Moon, Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'

const teacherNav = [
  { label: 'Dashboard',    href: '/dashboard/teacher',              icon: LayoutDashboard },
  { label: 'My Courses',   href: '/dashboard/teacher/courses',      icon: BookOpen },
  { label: 'Start Session',href: '/dashboard/teacher/session',      icon: QrCode },
  { label: 'Records',      href: '/dashboard/teacher/records',      icon: ClipboardList },
  { label: 'Analytics',    href: '/dashboard/teacher/analytics',    icon: BarChart3 },
  { label: 'Defaulters',   href: '/dashboard/teacher/defaulters',   icon: AlertTriangle },
  { label: 'Reports',      href: '/dashboard/teacher/reports',      icon: FileDown },
]

const studentNav = [
  { label: 'Dashboard',       href: '/dashboard/student',                  icon: LayoutDashboard },
  { label: 'Mark Attendance', href: '/attendance/mark',                    icon: ScanFace },
  { label: 'My Attendance',   href: '/dashboard/student/attendance',       icon: ClipboardList },
  { label: 'Courses',         href: '/dashboard/student/courses',          icon: BookOpen },
  { label: 'Alerts',          href: '/dashboard/student/alerts',           icon: Bell },
  { label: 'Face Enroll',     href: '/dashboard/student/face-enroll',      icon: ScanFace },
]

const adminNav = [
  { label: 'Dashboard',    href: '/dashboard/admin',                icon: LayoutDashboard },
  { label: 'Students',     href: '/dashboard/admin/students',       icon: GraduationCap },
  { label: 'Teachers',     href: '/dashboard/admin/teachers',       icon: Users },
  { label: 'Courses',      href: '/dashboard/admin/courses',        icon: BookOpen },
  { label: 'Departments',  href: '/dashboard/admin/departments',    icon: Building2 },
  { label: 'Analytics',    href: '/dashboard/admin/analytics',      icon: BarChart3 },
  { label: 'Settings',     href: '/dashboard/admin/settings',       icon: Settings },
]

const navByRole: Record<string, typeof teacherNav> = {
  teacher: teacherNav, student: studentNav,
  admin: adminNav, super_admin: adminNav,
}

const roleBadgeColors: Record<string, string> = {
  teacher:    'bg-blue-100 text-blue-700',
  student:    'bg-emerald-100 text-emerald-700',
  admin:      'bg-purple-100 text-purple-700',
  super_admin:'bg-rose-100 text-rose-700',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (!user && mounted) router.push('/auth/login') }, [user, mounted, router])

  if (!user) return null

  const nav = navByRole[user.role] || teacherNav
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const pageLabel = pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'

  const handleLogout = () => { logout(); router.push('/auth/login') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
            <QrCode size={15} className="text-white" />
          </div>
          <div>
            <div className="font-display font-black text-slate-900 text-sm leading-tight">SmartAttend</div>
            <div className="text-xs text-slate-400">AI Platform</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard/teacher' && href !== '/dashboard/student' && href !== '/dashboard/admin' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`sidebar-item ${active ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
              {active && <ChevronRight size={13} className="ml-auto opacity-40" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md capitalize ${roleBadgeColors[user.role] || 'bg-slate-100 text-slate-600'}`}>
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button onClick={handleLogout}
          className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="dashboard-layout">
      {/* Desktop sidebar */}
      <aside className="sidebar hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="sidebar fixed left-0 top-0 z-50 lg:hidden flex">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="main-content min-w-0">
        {/* Topbar */}
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="btn-icon btn-ghost lg:hidden">
              <Menu size={20} />
            </button>
            <h1 className="font-display font-black text-slate-900 text-sm capitalize">{pageLabel}</h1>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="btn-icon btn-ghost text-slate-400">
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}
            <button className="btn-icon btn-ghost text-slate-400 relative">
              <Bell size={17} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              {initials}
            </div>
          </div>
        </header>

        {/* Page */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="page-content"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
