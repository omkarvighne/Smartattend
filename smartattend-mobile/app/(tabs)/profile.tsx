import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import { Colors, Radius, Shadow } from '@/lib/theme'

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon as any} size={18} color={Colors.brand} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar header */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Unknown'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role?.toUpperCase() ?? 'STUDENT'}</Text>
        </View>
      </View>

      {/* Info card */}
      <View style={[styles.card, Shadow.card]}>
        <Text style={styles.cardTitle}>Account Details</Text>
        <ProfileRow icon="mail-outline" label="Email" value={user?.email ?? '--'} />
        <ProfileRow icon="person-outline" label="Role" value={user?.role ?? '--'} />
        <ProfileRow icon="id-card-outline" label="ID" value={String(user?.id ?? '--')} />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgSecondary },
  content: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  badge: {
    backgroundColor: Colors.brand + '20',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  badgeText: { color: Colors.brand, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' },
  rowValue: { fontSize: 15, color: Colors.text, fontWeight: '500', marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: Radius.lg,
    padding: 16,
  },
  logoutText: { color: Colors.danger, fontSize: 15, fontWeight: '700' },
})
