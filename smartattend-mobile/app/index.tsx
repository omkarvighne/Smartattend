import { useEffect } from 'react'
import { Redirect } from 'expo-router'
import { useAuthStore } from '../src/store/authStore'
import { View, ActivityIndicator } from 'react-native'
import { Colors } from '../src/lib/theme'

export default function Index() {
  const { isLoggedIn, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    )
  }

  return <Redirect href={isLoggedIn ? '/(tabs)' : '/login'} />
}
