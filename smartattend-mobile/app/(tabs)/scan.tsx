import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useState, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { attendanceApi } from '@/lib/api'
import { Colors, Radius } from '@/lib/theme'

type ScanState = 'idle' | 'scanning' | 'processing' | 'face_ready' | 'face_verifying' | 'success' | 'error'

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [message, setMessage] = useState('')
  const lastScanned = useRef<string | null>(null)
  const sessionTokenRef = useRef<string | null>(null)
  const cameraRef = useRef<CameraView>(null)

  // Step 1: QR code scanned
  const handleBarCode = async ({ data }: { data: string }) => {
    if (data === lastScanned.current || scanState === 'processing') return
    lastScanned.current = data

    // Extract token
    let sessionToken = data
    if (data.includes('token=')) {
      sessionToken = data.split('token=')[1]
    }

    sessionTokenRef.current = sessionToken
    // Move to face scan step
    setScanState('face_ready')
  }

  // Step 2: Face verification
  const startFaceVerify = async () => {
    setScanState('face_verifying')
    setMessage('Scanning face...')
  
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: true,
      })
  
      if (!photo?.uri) throw new Error('Camera capture failed')
  
      setMessage('Verifying face...')
      await attendanceApi.verifyAndMark(sessionTokenRef.current!, photo.uri)
  
      setScanState('success')
      setMessage('Attendance marked successfully!')
    } catch (err: any) {
      setScanState('error')
      setMessage(err.message ?? 'Face verification failed')
    }
  
    setTimeout(() => {
      setScanState('idle')
      setMessage('')
      lastScanned.current = null
      sessionTokenRef.current = null
    }, 3000)
  }

  const startScanning = () => {
    setScanState('scanning')
    lastScanned.current = null
  }

  if (!permission) return <View style={styles.container} />

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={64} color={Colors.textTertiary} />
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSub}>We need camera permission to scan QR codes.</Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (scanState === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <Ionicons name="qr-code-outline" size={48} color={Colors.brand} />
          </View>
          <Text style={styles.idleTitle}>Ready to Scan</Text>
          <Text style={styles.idleSub}>Tap the button to open camera and scan your session QR code.</Text>
          <TouchableOpacity style={styles.startButton} onPress={startScanning} activeOpacity={0.9}>
            <Text style={styles.startButtonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ── QR SCANNING ───────────────────────────────────────────────────────────
  if (scanState === 'scanning') {
    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={handleBarCode}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
        <View style={styles.overlay}>
          <Text style={styles.stepLabel}>STEP 1 OF 2</Text>
          <View style={styles.frame} />
          <Text style={styles.hint}>Point at session QR code</Text>
        </View>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setScanState('idle')}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    )
  }

  // ── FACE SCAN ─────────────────────────────────────────────────────────────
  if (scanState === 'face_ready' || scanState === 'face_verifying') {
    const isVerifying = scanState === 'face_verifying'
    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="front"
        />

        {/* Dark overlay with oval cutout effect */}
        <View style={styles.overlay}>
          <Text style={styles.stepLabel}>STEP 2 OF 2</Text>

          {/* Face oval */}
          <View style={[styles.faceOval, isVerifying && styles.faceOvalActive]} />

          <Text style={styles.hint}>
            {isVerifying ? 'Hold still...' : 'Position your face in the oval'}
          </Text>

          {!isVerifying && (
            <TouchableOpacity style={styles.verifyButton} onPress={startFaceVerify} activeOpacity={0.85}>
              <Ionicons name="scan" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.verifyButtonText}>Verify Face</Text>
            </TouchableOpacity>
          )}

          {isVerifying && (
            <View style={styles.verifyingRow}>
              <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.verifyingText}>{message}</Text>
            </View>
          )}
        </View>

        {!isVerifying && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => setScanState('idle')}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  // ── SUCCESS / ERROR ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={[
          styles.resultCircle,
          { backgroundColor: scanState === 'success' ? Colors.success + '20' : Colors.danger + '20' }
        ]}>
          <Ionicons
            name={scanState === 'success' ? 'checkmark-circle' : 'close-circle'}
            size={72}
            color={scanState === 'success' ? Colors.success : Colors.danger}
          />
        </View>
        <Text style={styles.resultTitle}>
          {scanState === 'success' ? 'Attendance Marked!' : 'Verification Failed'}
        </Text>
        <Text style={styles.resultSub}>{message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.bgSecondary,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  idleTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  idleSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  startButton: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepLabel: {
    position: 'absolute',
    top: 60,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // QR frame
  frame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: Colors.brand,
    borderRadius: Radius.lg,
    backgroundColor: 'transparent',
  },

  // Face oval
  faceOval: {
    width: 200,
    height: 260,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 120,
    backgroundColor: 'transparent',
  },
  faceOvalActive: {
    borderColor: Colors.brand,
    borderWidth: 3,
  },

  hint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.lg,
    marginTop: 8,
  },
  verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verifyingText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  cancelButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultTitle: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  resultSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },

  permTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginTop: 16, marginBottom: 8 },
  permSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  permButton: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  permButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})