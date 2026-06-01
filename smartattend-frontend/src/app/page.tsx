'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { QrCode, ScanFace, BarChart3, Shield, FileDown, Bell, ArrowRight, CheckCircle, Zap } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] } }),
}

const features = [
  { icon: QrCode,    bg: 'bg-indigo-500', title: 'Rotating QR Codes', desc: 'Auto-refresh every 30 seconds. Students scan with any camera. No app needed.' },
  { icon: ScanFace,  bg: 'bg-purple-500', title: 'AI Face Verification', desc: 'DeepFace-powered identity check eliminates proxy attendance instantly.' },
  { icon: BarChart3, bg: 'bg-sky-500',    title: 'Live Analytics', desc: 'Real-time dashboards showing attendance trends, course breakdowns and insights.' },
  { icon: Bell,      bg: 'bg-amber-400',  title: 'Auto Defaulter Alerts', desc: 'Students below 75% are flagged automatically. Export lists in one click.' },
  { icon: FileDown,  bg: 'bg-emerald-500',title: 'PDF & Excel Reports', desc: 'Daily, monthly, semester reports in your preferred format, always ready.' },
  { icon: Shield,    bg: 'bg-rose-500',   title: 'Privacy First', desc: 'Only embeddings are stored — never raw photos. AES-256 encrypted at rest.' },
]

const steps = [
  { n: '1', title: 'Teacher starts session', desc: 'Select course, click Start. QR appears instantly — rotating every 30 seconds.', color: 'bg-indigo-50 border-indigo-100' },
  { n: '2', title: 'Student scans QR', desc: 'Any phone camera works. Scans the QR on the projector — browser opens automatically.', color: 'bg-purple-50 border-purple-100' },
  { n: '3', title: 'Face verified by AI', desc: 'Camera opens, face is matched against stored embedding in under 2 seconds.', color: 'bg-sky-50 border-sky-100' },
  { n: '4', title: 'Attendance recorded', desc: 'Record saved with timestamp. Dashboard updates live. Reports ready to download.', color: 'bg-emerald-50 border-emerald-100' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <QrCode size={16} className="text-white" />
            </div>
            <span className="font-display font-black text-slate-900 text-lg tracking-tight">SmartAttend</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/auth/login" className="btn-primary btn-sm">Get started →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center overflow-hidden">
        {/* Soft blobs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-6">
            <span className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI-powered · No hardware required · Ready in 5 minutes
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-6xl md:text-8xl font-display font-black text-slate-900 leading-[0.9] tracking-tight mb-8"
          >
            Attendance,<br />
            <span className="text-indigo-500">finally smart.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Rotating QR codes + AI face verification = zero proxy attendance.
            Built for colleges, institutes, and training centers.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/login" className="btn-primary btn-lg w-full sm:w-auto justify-center">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link href="/auth/login" className="btn-white btn-lg w-full sm:w-auto justify-center">
              View demo dashboard
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-400">
            {[
              { val: '< 5s', label: 'to mark attendance' },
              { val: '98%+', label: 'face accuracy' },
              { val: '0', label: 'proxy attacks' },
            ].map(({ val, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="font-display font-black text-slate-900 text-base">{val}</span>
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard preview */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={5}
          className="relative max-w-5xl mx-auto mt-20"
        >
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-[#fafafa]">
            {/* Browser chrome */}
            <div className="h-10 bg-white border-b border-slate-100 flex items-center gap-2 px-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-300" />
                <div className="w-3 h-3 rounded-full bg-amber-300" />
                <div className="w-3 h-3 rounded-full bg-green-300" />
              </div>
              <div className="flex-1 mx-4 bg-slate-100 rounded-lg h-5 flex items-center px-3">
                <span className="text-xs text-slate-400">smartattend.ai/dashboard/teacher</span>
              </div>
            </div>
            {/* Fake dashboard */}
            <div className="flex h-64">
              {/* Sidebar */}
              <div className="w-48 bg-white border-r border-slate-100 p-4 flex flex-col gap-1">
                {[['Dashboard', true], ['Courses', false], ['Start Session', false], ['Reports', false], ['Defaulters', false]].map(([t, a]) => (
                  <div key={t as string} className={`text-xs px-3 py-2 rounded-xl font-medium ${a ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>{t}</div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 p-5">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[['3','Today\'s sessions','bg-indigo-500'],['79%','Avg attendance','bg-purple-500'],['7','Defaulters','bg-amber-400'],['142','Students','bg-emerald-500']].map(([v,l,c]) => (
                    <div key={l as string} className={`${c} rounded-2xl p-3 text-white`}>
                      <div className="text-xl font-black">{v}</div>
                      <div className="text-xs opacity-80 mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white rounded-2xl p-4 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold text-indigo-700">Live Session — DSA · SE-B</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                        <QrCode size={32} className="text-slate-300" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-900">24<span className="text-sm font-normal text-slate-400">/48</span></div>
                        <div className="text-xs text-slate-400 mb-1.5">students present</div>
                        <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-36 bg-white rounded-2xl p-3 border border-slate-100">
                    <div className="text-xs text-slate-400 mb-2">Week trend</div>
                    <div className="flex items-end gap-1 h-10">
                      {[65,72,80,68,75,82,79].map((v,i) => (
                        <div key={i} className="flex-1 rounded-sm" style={{ height: `${v*0.5}%`, background: v<75?'#fbbf24':'#6366f1' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14">
            <h2 className="text-5xl font-display font-black text-slate-900 mb-4">
              Everything you need,<br />nothing you don't.
            </h2>
            <p className="text-slate-400 text-lg max-w-xl">One platform for students, teachers, and admins. No expensive hardware. No complex setup.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, bg, title, desc }, i) => (
              <motion.div key={title} variants={fadeUp} initial="hidden" whileInView="show" custom={i % 3} viewport={{ once: true }}
                className="card-hover p-6 group">
                <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14 text-center">
            <h2 className="text-5xl font-display font-black text-slate-900 mb-4">Done in 4 steps.</h2>
            <p className="text-slate-400 text-lg">The entire attendance process takes under 30 seconds.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map(({ n, title, desc, color }, i) => (
              <motion.div key={n} variants={fadeUp} initial="hidden" whileInView="show" custom={i * 0.08} viewport={{ once: true }}
                className={`rounded-3xl border p-6 ${color} relative overflow-hidden`}>
                <div className="text-7xl font-display font-black text-slate-900/5 absolute -top-3 -right-2 leading-none select-none">{n}</div>
                <div className="text-4xl font-display font-black text-slate-900/10 mb-4">{n}</div>
                <h3 className="font-display font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-5xl font-display font-black text-white mb-6 leading-tight">
              Ready to eliminate<br />proxy attendance?
            </h2>
            <p className="text-slate-400 text-lg mb-10">No hardware. No apps. AI-powered from day one.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/login" className="btn bg-white text-slate-900 hover:bg-slate-100 btn-lg justify-center">
                <Zap size={18} /> Get started free
              </Link>
              <Link href="/auth/login" className="btn border border-slate-700 text-slate-300 hover:bg-slate-800 btn-lg justify-center">
                View demo →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center">
              <QrCode size={13} className="text-white" />
            </div>
            <span className="font-display font-black text-slate-900">SmartAttend AI</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            {['Privacy', 'Terms', 'API Docs', 'Contact'].map(l => (
              <a key={l} href="#" className="hover:text-slate-700 transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs text-slate-300">© 2025 SmartAttend AI · Built in Pune 🇮🇳</p>
        </div>
      </footer>
    </div>
  )
}
