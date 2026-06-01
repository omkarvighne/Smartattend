'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { QrCode, Eye, EyeOff, ArrowRight, Loader2, ScanFace, BarChart3, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})
type FormData = z.infer<typeof schema>

const demos = [
  { label: 'Admin', email: 'admin@smartattend.ai', password: 'admin123', color: 'bg-purple-100 text-purple-700' },
  { label: 'Teacher', email: 'rpatil@jspm.edu.in', password: 'teacher123', color: 'bg-blue-100 text-blue-700' },
  { label: 'Student', email: 'omkar@jspm.edu.in', password: 'student123', color: 'bg-emerald-100 text-emerald-700' },
]

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore(s => s.login)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }: FormData) => {
    try {
      await login(email, password)
      const user = useAuthStore.getState().user
      const routes: Record<string, string> = {
        student: '/dashboard/student', teacher: '/dashboard/teacher',
        admin: '/dashboard/admin', super_admin: '/dashboard/admin',
      }
      router.push(routes[user?.role || 'teacher'] || '/dashboard/teacher')
      toast.success(`Welcome back, ${user?.name?.split(' ')[0]}!`)
    } catch {
      toast.error('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#fafafa]">

      {/* Left — branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col w-[46%] bg-slate-900 relative overflow-hidden p-12"
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Colored blobs */}
        <div className="absolute top-32 left-8 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-48 right-8 w-36 h-36 bg-purple-500 rounded-full blur-3xl opacity-20" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-auto">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <QrCode size={18} className="text-white" />
            </div>
            <span className="font-display font-black text-white text-xl">SmartAttend AI</span>
          </Link>

          {/* Headline */}
          <div className="mb-12">
            <h1 className="text-5xl font-display font-black text-white leading-tight mb-5">
              Attendance<br />that just works.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs">
              AI face verification meets rotating QR codes. Proxy attendance is now impossible.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: QrCode,   text: 'QR rotates every 30 seconds' },
              { icon: ScanFace, text: 'Face verified in under 2 seconds' },
              { icon: BarChart3,text: 'Real-time analytics dashboard' },
              { icon: Shield,   text: 'Embeddings stored, never raw photos' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-slate-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right — form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 flex items-center justify-center px-8 py-12"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <QrCode size={15} className="text-white" />
            </div>
            <span className="font-display font-black text-slate-900">SmartAttend AI</span>
          </div>

          <h2 className="text-3xl font-display font-black text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-7">Sign in to your dashboard</p>

          {/* Demo accounts */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium mb-3">Demo accounts — click to fill:</p>
            <div className="flex gap-2">
              {demos.map(({ label, email, password, color }) => (
                <button key={label} onClick={() => { setValue('email', email); setValue('password', password) }}
                  className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all hover:scale-105 ${color}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-group">
              <label className="label">Email</label>
              <input {...register('email')} type="email" placeholder="you@jspm.edu.in"
                className={`input ${errors.email ? 'border-red-300 ring-red-200' : ''}`} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? 'border-red-300 ring-red-200' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="btn-primary btn-lg w-full justify-center">
              {isSubmitting
                ? <><Loader2 size={17} className="animate-spin" /> Signing in...</>
                : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            New student?{' '}
            <span className="text-slate-600 font-medium">Contact your admin to get registered.</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
