import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useAuthStore } from '../../src/store/authStore'
import { Colors, Radius, Shadow } from '../../src/lib/theme'

const menuItems = [
  { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
  { icon: 'camera-outline', label: 'Update Face Enrollment', onPress: () => {} },
  { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
  { icon: 'shield-checkmark-outline', label: 'Privacy & Security', onPress: () => {} },
  { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
]

export default function ProfileScreen() {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/login') } },
    ])
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SA'

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Header */}
      <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Student'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.replace('_', ' ').toUpperCase() || 'STUDENT'}</Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Overall', value: '76%' },
          { label: 'Courses', value: '5' },
          { label: 'Sessions', value: '38' },
        ].map(({ label, value }) => (
          <View key={label} style={styles.statItem}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map(({ icon, label, onPress }) => (
          <TouchableOpacity key={label} style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuIcon}>
              <Ionicons name={icon as any} size={20} color={Colors.brand} />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* App info */}
      <View style={styles.appInfo}>
        <View style={styles.appInfoRow}>
          <View style={styles.appIcon}>
            <Ionicons name="qr-code" size={18} color="white" />
          </View>
          <View>
            <Text style={styles.appName}>SmartAttend AI</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgSecondary },
  header: { paddingTop: 70, paddingBottom: 32, alignItems: 'center' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontSize: 28, fontWeight: '900', color: 'white' },
  name: { fontSize: 22, fontWeight: '800', color: 'white', letterSpacing: -0.3 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  roleBadge: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: Radius.full },
  roleText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.card, marginHorizontal: 20, marginTop: -16, borderRadius: Radius.xl, ...Shadow.card, paddingVertical: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textTertiary, marginTop: 2, fontWeight: '500' },
  menu: { marginHorizontal: 20, marginTop: 20, backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.card },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.bgTertiary },
  menuIcon: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  appInfo: { marginHorizontal: 20, marginTop: 16, backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 16, ...Shadow.card },
  appInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.brand, justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  appVersion: { fontSize: 12, color: Colors.textTertiary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, marginTop: 16, backgroundColor: '#fef2f2', borderRadius: Radius.xl, paddingVertical: 16, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
})
