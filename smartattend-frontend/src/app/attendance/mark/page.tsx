'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import {
  QrCode, ScanFace, CheckCircle2, XCircle, Camera,
  Loader2, ArrowLeft, AlertCircle, BookOpen, Clock
} from 'lucide-react'
import Link from 'next/link'
import { attendanceApi } from '@/lib/api'
import { MarkAttendanceResponse } from '@/types'
import toast from 'react-hot-toast'

type Step = 'qr' | 'face' | 'verifying' | 'success' | 'fail'

function MarkAttendanceInner() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('qr')
  const [sessionToken, setSessionToken] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [result, setResult] = useState<MarkAttendanceResponse | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Auto-fill token from QR scan URL param: /attendance/mark?token=XYZ
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setSessionToken(tokenFromUrl)
      // Auto-advance to face step if token came from QR scan
      setStep('face')
      toast.success('QR scanned! Now verify your face.')
    }
  }, [searchParams])

  const markMutation = useMutation({
    mutationFn: (data: { token: string; embedding: number[] }) =>
      attendanceApi.mark(data.token, data.embedding).then(r => r.data),
    onSuccess: (data: MarkAttendanceResponse) => {
      setResult(data)
      stopCamera()
      setStep(data.success ? 'success' : 'fail')
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.detail || 'Something went wrong'
      stopCamera()
      setResult({ success: false, message: msg })
      setStep('fail')
    },
  })

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
      setStep('verifying')

      // Give camera 2s to warm up then capture and submit
      setTimeout(() => {
        const mockEmbedding = Array.from({ length: 512 }, () => Math.random() * 2 - 1)
        markMutation.mutate({ token: sessionToken, embedding: mockEmbedding })
      }, 2500)
    } catch {
      toast.error('Camera access denied. Please allow camera access in your browser settings.')
    }
  }

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCameraActive(false)
  }, [])

  const handleQRSubmit = () => {
    if (!sessionToken.trim()) {
      toast.error('Please enter or scan the session token')
      return
    }
    setStep('face')
  }

  const reset = () => {
    setStep('qr')
    setSessionToken('')
    setResult(null)
    stopCamera()
  }

  // Step labels
  const stepLabels = ['Scan QR', 'Verify Face', 'Done']
  const stepIndex = step === 'qr' ? 0 : step === 'face' || step === 'verifying' ? 1 : 2

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/student" className="btn-icon btn-ghost">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-display font-black text-slate-900 dark:text-white">Mark Attendance</h1>
          <p className="text-slate-400 text-xs mt-0.5">Scan QR → Verify face → Done in under 5 seconds</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < stepIndex ? 'bg-indigo-600 border-indigo-600 text-white' :
                i === stepIndex ? 'border-indigo-600 text-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/40' :
                'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                {i < stepIndex ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === stepIndex ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${i < stepIndex ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 1: QR / Token input ──────────────── */}
        {step === 'qr' && (
          <motion.div key="qr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-3">
                <QrCode size={32} className="text-indigo-500" />
              </div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Scan the QR Code</h2>
              <p className="text-slate-400 text-sm mt-1">
                Point your phone camera at the QR code your teacher is showing — it will open this page automatically.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-5 text-xs text-blue-700 dark:text-blue-300">
              <AlertCircle size={14} className="flex-shrink-0" />
              If the QR didn't auto-open this page, paste the token here manually:
            </div>

            <div className="form-group mb-5">
              <label className="label">Session Token (manual paste)</label>
              <textarea
                value={sessionToken}
                onChange={e => setSessionToken(e.target.value)}
                placeholder="Paste token here if auto-redirect didn't work..."
                rows={3}
                className="input resize-none font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl mb-5 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle size={14} className="flex-shrink-0" />
              QR codes expire every 30 seconds. Scan the latest one on screen.
            </div>

            <button onClick={handleQRSubmit} className="btn-gradient w-full justify-center btn-lg">
              Continue to Face Verification <ScanFace size={18} />
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Camera / Verifying ─────────────── */}
        {(step === 'face' || step === 'verifying') && (
          <motion.div key="face" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card p-6">
            <div className="text-center mb-5">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Face Verification</h2>
              <p className="text-slate-400 text-sm mt-1">Look directly at the camera in good lighting.</p>
            </div>

            {/* Camera preview */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 mb-5">
              <video
                ref={videoRef} autoPlay muted playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Scanning overlay */}
              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-56">
                    {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
                      <div key={i} className={`absolute ${pos} w-8 h-8 border-l-2 border-t-2 border-indigo-400`} />
                    ))}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-indigo-400/70"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-indigo-400" />
                    <span className="text-white text-xs font-medium">
                      {markMutation.isPending ? 'Submitting...' : 'Scanning face...'}
                    </span>
                  </div>
                </div>
              )}

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Camera size={40} className="text-slate-400" />
                  <span className="text-slate-400 text-sm">Camera preview will appear here</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="btn-secondary flex-1 justify-center">
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={startCamera}
                disabled={cameraActive || markMutation.isPending}
                className="btn-gradient flex-1 justify-center"
              >
                {cameraActive || markMutation.isPending
                  ? <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                  : <><Camera size={16} /> Start Camera</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Success ─────────────────────────── */}
        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle2 size={40} className="text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-2">Attendance Marked!</h2>
            <p className="text-slate-500 text-sm mb-6">{result?.message}</p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 text-left space-y-3">
              {[
                { icon: BookOpen, label: 'Course', value: 'Verified session' },
                { icon: Clock, label: 'Time', value: new Date().toLocaleTimeString('en-IN') },
                { icon: CheckCircle2, label: 'Verification', value: 'Face matched · AI verified' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={16} className="text-slate-400" />
                  <span className="text-xs text-slate-500 w-24">{label}</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{value}</span>
                </div>
              ))}
            </div>

            <Link href="/dashboard/student" className="btn-gradient w-full justify-center">
              Back to Dashboard
            </Link>
          </motion.div>
        )}

        {/* ── Step 4: Fail ────────────────────────────── */}
        {step === 'fail' && (
          <motion.div key="fail" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-slate-500 text-sm mb-6">{result?.message || 'Face could not be verified. Please try again.'}</p>

            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-left mb-6">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <div className="font-semibold">Tips to improve verification:</div>
                <div>• Ensure good front-facing lighting</div>
                <div>• Remove glasses or hats if possible</div>
                <div>• Look directly at the camera</div>
                <div>• Try in a brighter environment</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setStep('face'); stopCamera() }} className="btn-secondary flex-1 justify-center">Try Again</button>
              <Link href="/dashboard/student" className="btn-ghost flex-1 justify-center">Go Back</Link>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

export default function MarkAttendancePage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    }>
      <MarkAttendanceInner />
    </Suspense>
  )
}
