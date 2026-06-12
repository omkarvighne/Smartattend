import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { studentsApi } from '@/lib/api'
import { Colors, Radius, Shadow } from '@/lib/theme'

function StatCard({ label, value, icon, color }: {
  label: string; value: string; icon: string; color: string
}) {
  return (
    <View style={[styles.statCard, Shadow.card]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function HomeScreen() {
  const { user } = useAuthStore()
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: () => studentsApi.mySummary().then((r) => r.data),
    enabled: !!user,
  })

  const firstName = user?.name?.split(' ')[0] ?? 'Student'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName[0]}</Text>
        </View>
      </View>

      {/* Stats */}
      {isLoading ? (
        <ActivityIndicator color={Colors.brand} style={{ marginVertical: 32 }} />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard
            label="Attendance"
            value={`${data?.attendance_percentage ?? '--'}%`}
            icon="checkmark-circle-outline"
            color={Colors.success}
          />
          <StatCard
            label="Enrolled"
            value={`${data?.total_subjects ?? '--'}`}
            icon="book-outline"
            color={Colors.brand}
          />
          <StatCard
            label="Present"
            value={`${data?.total_present ?? '--'}`}
            icon="calendar-outline"
            color={Colors.warning}
          />
          <StatCard
            label="Absent"
            value={`${data?.total_absent ?? '--'}`}
            icon="close-circle-outline"
            color={Colors.danger}
          />
        </View>
      )}

      {/* Quick Action */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push('/(tabs)/scan')}
        activeOpacity={0.9}
      >
        <Ionicons name="qr-code-outline" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>Mark Attendance</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Recent subjects */}
      {data?.recent_subjects && data.recent_subjects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Classes</Text>
          {data.recent_subjects.map((s: any, i: number) => (
            <View key={i} style={[styles.subjectRow, Shadow.card]}>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{s.name}</Text>
                <Text style={styles.subjectCode}>{s.code}</Text>
              </View>
              <Text style={[
                styles.subjectPct,
                { color: s.percentage >= 75 ? Colors.success : Colors.danger }
              ]}>
                {s.percentage}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgSecondary },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  scanButton: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  scanButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, marginLeft: 12 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subjectRow: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  subjectCode: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  subjectPct: { fontSize: 16, fontWeight: '700' },
})
