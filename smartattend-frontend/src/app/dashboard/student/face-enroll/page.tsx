'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { Camera, CheckCircle2, Upload, Info, Loader2, RefreshCw } from 'lucide-react'
import { studentsApi } from '@/lib/api'
import toast from 'react-hot-toast'

const steps = ['Capture Photos', 'Process & Enroll', 'Complete']

export default function FaceEnrollPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [captures, setCaptures] = useState<string[]>([])
  const [cameraOn, setCameraOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const enrollMutation = useMutation({
    mutationFn: async () => {
      for (const dataUrl of captures) {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        const file = new File([blob], 'face.jpg', { type: 'image/jpeg' })
  
        const formData = new FormData()
        formData.append('file', file)
  
        const token = localStorage.getItem('access_token')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/attendance/face/enroll`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        )
  
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.detail ?? 'Enrollment failed')
        }
      }
    },
    onSuccess: () => {
      setCurrentStep(2)
      toast.success('Face enrolled successfully!')
    },
    onError: (err: any) => toast.error(err.message ?? 'Enrollment failed. Please try again.'),
  })

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640 } })
    streamRef.current = stream
    if (videoRef.current) videoRef.current.srcObject = stream
    setCameraOn(true)
  }

  const capture = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    setCaptures(prev => [...prev, canvas.toDataURL('image/jpeg', 0.8)])
    if (captures.length >= 4) {
      streamRef.current?.getTracks().forEach(t => t.stop())
      setCameraOn(false)
    }
  }

  const reset = () => {
    setCaptures([])
    setCurrentStep(0)
    setCameraOn(false)
  }

  const proceed = () => {
    setCurrentStep(1)
    setTimeout(() => enrollMutation.mutate(), 800)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">Face Enrollment</h1>
        <p className="text-slate-500 text-sm mt-0.5">Capture 5 photos for AI face verification during attendance.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= currentStep ? 'text-indigo-600' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < currentStep ? 'bg-indigo-600 border-indigo-600 text-white' :
                i === currentStep ? 'border-indigo-600 text-indigo-600' :
                'border-slate-200 text-slate-400'
              }`}>
                {i < currentStep ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${i < currentStep ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div key="capture" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl">
              <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <div className="font-semibold mb-1">Tips for best results</div>
                <div className="space-y-0.5">
                  <div>• Face the camera directly with good lighting</div>
                  <div>• Capture: front, slight left, slight right, slightly up, slightly down</div>
                  <div>• Remove glasses or hats for better accuracy</div>
                  <div>• Your raw photos are NOT stored — only AI embeddings</div>
                </div>
              </div>
            </div>

            {/* Camera */}
            <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-slate-900">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              {cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-56">
                    {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
                      <div key={i} className={`absolute ${pos} w-6 h-6 border-l-2 border-t-2 border-indigo-400`} />
                    ))}
                  </div>
                </div>
              )}
              {!cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={40} className="text-slate-600" />
                </div>
              )}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                {captures.length}/5 captured
              </div>
            </div>

            {/* Captured thumbnails */}
            {captures.length > 0 && (
              <div className="flex gap-2 justify-center">
                {captures.map((src, i) => (
                  <img key={i} src={src} alt={`Capture ${i+1}`}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-400" />
                ))}
                {Array.from({ length: Math.max(0, 5 - captures.length) }).map((_, i) => (
                  <div key={i} className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700" />
                ))}
              </div>
            )}

            <div className="flex gap-3">
              {!cameraOn ? (
                <button onClick={startCamera} className="btn-gradient flex-1 justify-center">
                  <Camera size={16} /> Start Camera
                </button>
              ) : (
                <button onClick={capture} disabled={captures.length >= 5}
                  className="btn-gradient flex-1 justify-center">
                  <Camera size={16} /> Capture Photo ({captures.length}/5)
                </button>
              )}
              {captures.length > 0 && (
                <button onClick={reset} className="btn-secondary">
                  <RefreshCw size={16} />
                </button>
              )}
            </div>

            {captures.length >= 3 && (
              <button onClick={proceed} className="btn-secondary w-full justify-center">
                Proceed with {captures.length} photo{captures.length > 1 ? 's' : ''} →
              </button>
            )}
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
              <Loader2 size={32} className="text-indigo-600 animate-spin" />
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">Processing your photos</h2>
            <p className="text-slate-400 text-sm">Extracting facial embeddings with AI. This takes just a moment...</p>
            <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
              {['Detecting face landmarks...', 'Generating embedding vectors...', 'Encrypting & storing securely...'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 size={11} className="animate-spin text-indigo-400" />
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 size={40} className="text-emerald-600" />
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-2">Face Enrolled!</h2>
            <p className="text-slate-500 text-sm mb-6">Your face has been registered. You can now mark attendance using face verification.</p>
            <div className="flex items-center gap-2 justify-center text-xs text-slate-400 mb-6">
              <Info size={12} />
              Your raw photos were deleted. Only the AI embedding vector is stored.
            </div>
            <a href="/dashboard/student" className="btn-gradient btn-lg w-full justify-center">
              Go to Dashboard
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
