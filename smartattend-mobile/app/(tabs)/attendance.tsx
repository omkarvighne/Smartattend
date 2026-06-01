import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius, Shadow } from '../../src/lib/theme'

const history = [
  { course: 'Data Structures', code: 'CSE301', date: 'Today 10:00 AM', status: 'present', score: 94 },
  { course: 'Operating Systems', code: 'CSE302', date: 'Today 11:30 AM', status: 'present', score: 97 },
  { course: 'DBMS', code: 'CSE303', date: 'Yesterday 2:00 PM', status: 'absent', score: null },
  { course: 'Computer Networks', code: 'CSE304', date: 'Yesterday 10:00 AM', status: 'present', score: 91 },
  { course: 'Software Engineering', code: 'CSE305', date: '2 days ago 12:00 PM', status: 'absent', score: null },
  { course: 'Data Structures', code: 'CSE301', date: '3 days ago 10:00 AM', status: 'present', score: 95 },
  { course: 'DBMS', code: 'CSE303', date: '3 days ago 2:00 PM', status: 'present', score: 88 },
]

export default function AttendanceScreen() {
  const present = history.filter(h => h.status === 'present').length
  const absent = history.filter(h => h.status === 'absent').length

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance History</Text>
        <Text style={styles.subtitle}>Your complete semester record</Text>
      </View>

      {/* Summary pills */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Total', value: history.length, color: Colors.brand, bg: '#eef2ff' },
          { label: 'Present', value: present, color: Colors.success, bg: '#f0fdf4' },
          { label: 'Absent', value: absent, color: Colors.danger, bg: '#fef2f2' },
        ].map(({ label, value, color, bg }) => (
          <View key={label} style={[styles.pill, { backgroundColor: bg }]}>
            <Text style={[styles.pillValue, { color }]}>{value}</Text>
            <Text style={[styles.pillLabel, { color }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* History list */}
      <View style={styles.list}>
        {history.map((h, i) => (
          <View key={i} style={styles.card}>
            <View style={[styles.statusDot, { backgroundColor: h.status === 'present' ? Colors.success : Colors.danger }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.courseName}>{h.course}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.code}>{h.code}</Text>
                <Text style={styles.dot}>·</Text>
                <Ionicons name="time-outline" size={11} color={Colors.textTertiary} />
                <Text style={styles.date}>{h.date}</Text>
              </View>
            </View>
            <View style={styles.right}>
              <View style={[styles.badge, { backgroundColor: h.status === 'present' ? '#f0fdf4' : '#fef2f2' }]}>
                <Ionicons
                  name={h.status === 'present' ? 'checkmark-circle' : 'close-circle'}
                  size={12}
                  color={h.status === 'present' ? Colors.success : Colors.danger}
                />
                <Text style={[styles.badgeText, { color: h.status === 'present' ? Colors.success : Colors.danger }]}>
                  {h.status === 'present' ? 'Present' : 'Absent'}
                </Text>
              </View>
              {h.score && <Text style={styles.score}>{h.score}% match</Text>}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgSecondary },
  header: { paddingTop: 64, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  pill: { flex: 1, borderRadius: Radius.xl, padding: 14, alignItems: 'center' },
  pillValue: { fontSize: 24, fontWeight: '900' },
  pillLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  list: { paddingHorizontal: 20, gap: 10 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadow.card },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  courseName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  code: { fontSize: 11, color: Colors.textTertiary, fontFamily: 'monospace' },
  dot: { color: Colors.textTertiary, fontSize: 11 },
  date: { fontSize: 11, color: Colors.textTertiary },
  right: { alignItems: 'flex-end', gap: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: 11, fontWeight: '700' },
  score: { fontSize: 10, color: Colors.success, fontWeight: '600' },
})
