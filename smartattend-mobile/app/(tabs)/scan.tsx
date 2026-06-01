import { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, Dimensions, Animated
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useMutation } from '@tanstack/react-query'
import { attendanceApi } from '../../src/lib/api'
import { Colors, Radius } from '../../src/lib/theme'

const { width } = Dimensions.get('window')
const SCAN_SIZE = width * 0.7

type Step = 'scan' | 'face' | 'verifying' | 'success' | 'fail'

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [step, setStep] = useState<Step>('scan')
  const [scannedToken, setScannedToken] = useState('')
  const [scanLock, setScanLock] = useState(false)
  const [message, setMessage] = useState('')
  const scanLineAnim = useRef(new Animated.Value(0)).current
  const cameraRef = useRef<CameraView>(null)

  // Animate scan line
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const markMutation = useMutation({
    mutationFn: (token: string) => {
      const mockEmbedding = Array.from({ length: 512 }, () => Math.random() * 2 - 1)
      return attendanceApi.mark(token, mockEmbedding).then(r => r.data)
    },
    onSuccess: (data) => {
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setMessage(data.message || 'Attendance marked!')
        setStep('success')
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        setMessage(data.message || 'Verification failed')
        setStep('fail')
      }
    },
    onError: (e: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setMessage(e?.response?.data?.detail || 'Something went wrong')
      setStep('fail')
    },
  })

  const handleQRScanned = ({ data }: { data: string }) => {
    if (scanLock || step !== 'scan') return
    setScanLock(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // Extract token from URL or use raw value
    let token = data
    try {
      const url = new URL(data)
      token = url.searchParams.get('token') || data
    } catch { /* raw token */ }

    setScannedToken(token)
    setStep('face')
  }

  const startFaceVerification = () => {
    setStep('verifying')
    // Simulate face capture — replace with real FaceDetector in production
    setTimeout(() => {
      markMutation.mutate(scannedToken)
    }, 2000)
  }

  const reset = () => {
    setStep('scan')
    setScannedToken('')
    setScanLock(false)
    setMessage('')
  }

  if (!permission) return <View style={styles.container} />

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="camera-outline" size={56} color={Colors.textTertiary} />
        <Text style={styles.permTitle}>Camera Permission Required</Text>
        <Text style={styles.permSub}>SmartAttend needs camera access to scan QR codes and verify your face.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Success screen ──────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: '#f0fdf4' }]}>
        <View style={styles.resultIcon}>
          <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
        </View>
        <Text style={[styles.resultTitle, { color: Colors.success }]}>Attendance Marked!</Text>
        <Text style={styles.resultSub}>{message}</Text>
        <TouchableOpacity style={[styles.resultBtn, { backgroundColor: Colors.success }]} onPress={reset}>
          <Text style={styles.resultBtnText}>Scan Another</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Fail screen ─────────────────────────────────────────────────────
  if (step === 'fail') {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: '#fef2f2' }]}>
        <View style={styles.resultIcon}>
          <Ionicons name="close-circle" size={72} color={Colors.danger} />
        </View>
        <Text style={[styles.resultTitle, { color: Colors.danger }]}>Verification Failed</Text>
        <Text style={styles.resultSub}>{message}</Text>
        <View style={styles.tipsBox}>
          {['Ensure good front-facing lighting', 'Remove glasses if possible', 'Look directly at camera'].map(t => (
            <Text key={t} style={styles.tip}>• {t}</Text>
          ))}
        </View>
        <TouchableOpacity style={[styles.resultBtn, { backgroundColor: Colors.danger }]} onPress={reset}>
          <Text style={styles.resultBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Face verification screen ────────────────────────────────────────
  if (step === 'face' || step === 'verifying') {
    return (
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFill} facing="front" ref={cameraRef} />
        <View style={styles.overlay}>
          {/* Face guide oval */}
          <View style={styles.faceGuide} />
          {step === 'verifying' && (
            <Animated.View style={[styles.faceScanLine, {
              transform: [{ translateY: scanLineAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 80] }) }]
            }]} />
          )}
        </View>
        <View style={styles.faceBottom}>
          <Text style={styles.faceTitle}>
            {step === 'verifying' ? 'Verifying your identity...' : 'Position your face in the oval'}
          </Text>
          {step === 'face' && (
            <TouchableOpacity onPress={startFaceVerification} style={styles.captureBtn} activeOpacity={0.85}>
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.captureBtnGrad}>
                {markMutation.isPending
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.captureBtnText}>Verify Face</Text>}
              </LinearGradient>
            </TouchableOpacity>
          )}
          {step === 'verifying' && <ActivityIndicator color="white" size="large" style={{ marginTop: 20 }} />}
          <TouchableOpacity onPress={reset} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ── QR Scanner ──────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={handleQRScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Dark overlay with hole */}
      <View style={styles.scanOverlay}>
        <View style={styles.scanTopMask} />
        <View style={styles.scanMiddle}>
          <View style={styles.scanSideMask} />
          <View style={styles.scanWindow}>
            {/* Corner brackets */}
            {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map(corner => (
              <View key={corner} style={[styles.corner, styles[corner as keyof typeof styles] as any]} />
            ))}
            {/* Animated scan line */}
            <Animated.View style={[styles.scanLine, {
              transform: [{ translateY: scanLineAnim.interpolate({ inputRange: [0, 1], outputRange: [0, SCAN_SIZE - 4] }) }]
            }]} />
          </View>
          <View style={styles.scanSideMask} />
        </View>
        <View style={styles.scanBottomMask}>
          <Text style={styles.scanHint}>Point at the QR code on your teacher's screen</Text>
          <Text style={styles.scanSub}>QR refreshes every 30 seconds — scan the latest one</Text>
        </View>
      </View>

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Scan QR Code</Text>
      </View>
    </View>
  )
}

const MASK_COLOR = 'rgba(0,0,0,0.65)'
const CORNER_SIZE = 24
const CORNER_THICKNESS = 3

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },

  // Camera permission
  permTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 20, marginBottom: 8, textAlign: 'center' },
  permSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  permBtn: { backgroundColor: Colors.brand, paddingHorizontal: 28, paddingVertical: 14, borderRadius: Radius.xl },
  permBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },

  // QR scan overlay
  scanOverlay: { ...StyleSheet.absoluteFillObject },
  scanTopMask: { flex: 1, backgroundColor: MASK_COLOR },
  scanMiddle: { flexDirection: 'row', height: SCAN_SIZE },
  scanSideMask: { flex: 1, backgroundColor: MASK_COLOR },
  scanWindow: { width: SCAN_SIZE, height: SCAN_SIZE, position: 'relative', overflow: 'hidden' },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: Colors.brand, opacity: 0.8 },
  scanBottomMask: { flex: 1.2, backgroundColor: MASK_COLOR, alignItems: 'center', paddingTop: 28 },
  scanHint: { color: 'white', fontSize: 15, fontWeight: '600', textAlign: 'center', paddingHorizontal: 24 },
  scanSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8, textAlign: 'center' },

  // Corner brackets
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderColor: Colors.brand },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderColor: Colors.brand },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderColor: Colors.brand },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderColor: Colors.brand },

  // Top bar
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  topTitle: { fontSize: 20, fontWeight: '800', color: 'white', textAlign: 'center' },

  // Face verification
  faceGuide: { width: 220, height: 280, borderRadius: 110, borderWidth: 2.5, borderColor: Colors.brand, backgroundColor: 'transparent' },
  faceScanLine: { position: 'absolute', left: '15%', right: '15%', height: 2, backgroundColor: Colors.brand, opacity: 0.8 },
  faceBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 32, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  faceTitle: { color: 'white', fontSize: 17, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  captureBtn: { width: '100%', borderRadius: Radius.xl, overflow: 'hidden', marginBottom: 12 },
  captureBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  captureBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  cancelBtn: { paddingVertical: 10 },
  cancelText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },

  // Result screens
  resultIcon: { marginBottom: 20 },
  resultTitle: { fontSize: 28, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  resultSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, paddingHorizontal: 24 },
  resultBtn: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: Radius.xl },
  resultBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  tipsBox: { backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: Radius.lg, padding: 16, marginBottom: 24, alignSelf: 'stretch' },
  tip: { fontSize: 13, color: Colors.warning, marginBottom: 4, fontWeight: '500' },
})
