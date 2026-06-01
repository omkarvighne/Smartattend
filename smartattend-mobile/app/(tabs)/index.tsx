import { useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useAuthStore } from '../../src/store/authStore'
import { studentsApi } from '../../src/lib/api'
import { Colors, Radius, Shadow } from '../../src/lib/theme'

const mockSummary = {
  overall_percentage: 76.4,
  course_stats: [
    { course_name: 'Data Structures', course_code: 'CSE301', attended: 34, total_sessions: 38, percentage: 89.5 },
    { course_name: 'Operating Systems', course_code: 'CSE302', attended: 31, total_sessions: 38, percentage: 81.6 },
    { course_name: 'DBMS', course_code: 'CSE303', attended: 29, total_sessions: 38, percentage: 76.3 },
    { course_name: 'Computer Networks', course_code: 'CSE304', attended: 27, total_sessions: 38, percentage: 71.1 },
    { course_name: 'Software Engineering', course_code: 'CSE305', attended: 26, total_sessions: 38, percentage: 68.4 },
  ],
}

export default function DashboardScreen() {
  const { user, logout } = useAuthStore()

  const { data: summary = mockSummary, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['mobile-summary'],
    queryFn: () => studentsApi.mySummary().then(r => r.data).catch(() => mockSummary),
  })

  const overall = summary.overall_percentage || 0
  const atRisk = summary.course_stats?.filter((c: any) => c.percentage < 75) || []

  const getColor = (pct: number) => pct >= 80 ? Colors.success : pct >= 75 ? Colors.brand : pct >= 65 ? Colors.warning : Colors.danger

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.brand} />}
    >
      {/* Header */}
      <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
          </TouchableOpacity>
        </View>

        {/* Overall attendance ring */}
        <View style={styles.overallCard}>
          <View style={styles.overallCircle}>
            <Text style={styles.overallPct}>{Math.round(overall)}%</Text>
            <Text style={styles.overallLabel}>overall</Text>
          </View>
          <View style={styles.overallStats}>
            <Text style={styles.overallTitle}>Semester Attendance</Text>
            <Text style={styles.overallSub}>{summary.course_stats?.length || 0} courses enrolled</Text>
            {atRisk.length > 0 && (
              <View style={styles.riskBadge}>
                <Ionicons name="warning" size={12} color={Colors.warning} />
                <Text style={styles.riskText}>{atRisk.length} course{atRisk.length > 1 ? 's' : ''} at risk</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Scan QR CTA */}
      <View style={styles.ctaRow}>
        <TouchableOpacity style={styles.ctaPrimary} onPress={() => router.push('/(tabs)/scan')} activeOpacity={0.85}>
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="qr-code" size={22} color="white" />
            <Text style={styles.ctaPrimaryText}>Mark Attendance</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
          <Ionicons name="analytics-outline" size={22} color={Colors.brand} />
          <Text style={styles.ctaSecondaryText}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Course cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course-wise Attendance</Text>
        {isLoading ? (
          <ActivityIndicator color={Colors.brand} style={{ marginTop: 20 }} />
        ) : (
          summary.course_stats?.map((c: any, i: number) => (
            <View key={c.course_code} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={[styles.courseIcon, { backgroundColor: `${getColor(c.percentage)}20` }]}>
                  <Ionicons name="book-outline" size={18} color={getColor(c.percentage)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseName} numberOfLines={1}>{c.course_name}</Text>
                  <Text style={styles.courseCode}>{c.course_code} · {c.attended}/{c.total_sessions} classes</Text>
                </View>
                <Text style={[styles.coursePct, { color: getColor(c.percentage) }]}>
                  {Number(c.percentage).toFixed(0)}%
                </Text>
              </View>
              {/* Progress bar */}
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, {
                  width: `${c.percentage}%` as any,
                  backgroundColor: getColor(c.percentage)
                }]} />
              </View>
              {c.percentage < 75 && (
                <Text style={styles.warningText}>
                  ⚠ Below 75% — attend all remaining classes
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgSecondary },
  header: { paddingTop: 60, paddingBottom: 28, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  userName: { fontSize: 26, fontWeight: '900', color: 'white', letterSpacing: -0.5 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: 'white' },
  overallCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.xl, padding: 16 },
  overallCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  overallPct: { fontSize: 22, fontWeight: '900', color: 'white' },
  overallLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  overallTitle: { fontSize: 16, fontWeight: '700', color: 'white', marginBottom: 2 },
  overallSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  overallStats: { flex: 1 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, alignSelf: 'flex-start' },
  riskText: { fontSize: 11, color: Colors.warning, fontWeight: '600' },
  ctaRow: { flexDirection: 'row', gap: 12, margin: 20 },
  ctaPrimary: { flex: 2, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.card },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 20 },
  ctaPrimaryText: { fontSize: 15, fontWeight: '700', color: 'white' },
  ctaSecondary: { flex: 1, backgroundColor: Colors.bg, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 16, ...Shadow.card },
  ctaSecondaryText: { fontSize: 12, fontWeight: '600', color: Colors.brand },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  courseCard: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 16, marginBottom: 12, ...Shadow.card },
  courseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  courseIcon: { width: 40, height: 40, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  courseName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  courseCode: { fontSize: 12, color: Colors.textTertiary, marginTop: 1 },
  coursePct: { fontSize: 18, fontWeight: '900' },
  progressBg: { height: 6, backgroundColor: Colors.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  warningText: { fontSize: 11, color: Colors.warning, marginTop: 8, fontWeight: '500' },
})
