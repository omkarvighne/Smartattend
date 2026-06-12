import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

const queryClient = new QueryClient()

function AuthGuard() {
  const { isLoggedIn, loadUser } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadUser().finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready) return
    if (segments.length === 0) return  // router not ready yet
    const inAuthGroup = segments[0] === '(auth)'
    console.log('AUTH STATE:', { isLoggedIn, inAuthGroup, segments, ready })
    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [ready, isLoggedIn, segments])

  return null
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <AuthGuard />
      </GestureHandlerRootView>
    </QueryClientProvider>
  )
}