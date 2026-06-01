import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../src/store/authStore'
import { Colors, Radius, Shadow } from '../src/lib/theme'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login, isLoading } = useAuthStore()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.')
      return
    }
    try {
      await login(email.trim().toLowerCase(), password)
      router.replace('/(tabs)')
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Invalid email or password'
      Alert.alert('Login failed', msg)
    }
  }

  const fillDemo = (role: 'admin' | 'teacher' | 'student') => {
    const creds = {
      admin:   { email: 'admin@smartattend.ai', password: 'admin123' },
      teacher: { email: 'rpatil@jspm.edu.in',   password: 'teacher123' },
      student: { email: 'omkar@jspm.edu.in',    password: 'student123' },
    }
    setEmail(creds[role].email)
    setPassword(creds[role].password)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header gradient */}
        <LinearGradient colors={['#4f46e5', '#7c3aed', '#c026d3']} style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="qr-code" size={20} color="white" />
            </View>
            <Text style={styles.logoText}>SmartAttend AI</Text>
          </View>
          <Text style={styles.heroText}>Attendance{'\n'}made smart</Text>
          <Text style={styles.heroSub}>AI face verification + rotating QR codes</Text>
        </LinearGradient>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to your dashboard</Text>

          {/* Demo buttons */}
          <View style={styles.demoRow}>
            <Text style={styles.demoLabel}>Quick login:</Text>
            <View style={styles.demoBtns}>
              {(['admin', 'teacher', 'student'] as const).map(role => (
                <TouchableOpacity key={role} style={styles.demoBtn} onPress={() => fillDemo(role)}>
                  <Text style={styles.demoBtnText}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@jspm.edu.in"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
                <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login button */}
          <TouchableOpacity onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
            <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.loginBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {isLoading
                ? <ActivityIndicator color="white" />
                : <><Text style={styles.loginBtnText}>Sign in</Text><Ionicons name="arrow-forward" size={18} color="white" /></>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  header: { paddingTop: 70, paddingBottom: 40, paddingHorizontal: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '700', color: 'white' },
  heroText: { fontSize: 40, fontWeight: '900', color: 'white', lineHeight: 44, letterSpacing: -1 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  card: { flex: 1, backgroundColor: Colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, padding: 28 },
  cardTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  demoRow: { marginBottom: 24 },
  demoLabel: { fontSize: 12, color: Colors.textTertiary, marginBottom: 8 },
  demoBtns: { flexDirection: 'row', gap: 8 },
  demoBtn: { flex: 1, backgroundColor: Colors.bgSecondary, paddingVertical: 8, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  demoBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.bg },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: Radius.xl, marginTop: 8 },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
})
