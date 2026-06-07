import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View, StatusBar } from 'react-native'
import { getSession, PortalSession } from './src/lib/auth'
import Navigation from './src/navigation'
import LoginScreen from './src/screens/LoginScreen'
import { theme } from './src/theme'

export default function App() {
  const [session, setSession]   = useState<PortalSession | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getSession().then((s) => {
      setSession(s)
      setLoading(false)
    })
  }, [])

  /* ── Splash loading ── */
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.primary,
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
        <ActivityIndicator color="#fff" size="large" />
      </View>
    )
  }

  /* ── Login ── */
  if (!session) {
    return (
      <LoginScreen
        onLogin={() => getSession().then(setSession)}
      />
    )
  }

  /* ── App principal ── */
  return (
    <Navigation
      session={session}
      onLogout={() => setSession(null)}
    />
  )
}
