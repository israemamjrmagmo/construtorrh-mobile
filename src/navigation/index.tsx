import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import HomeScreen from '../screens/HomeScreen'
import PontoScreen from '../screens/PontoScreen'
import PerfilScreen from '../screens/PerfilScreen'
import PlaceholderScreen from '../screens/PlaceholderScreen'
import { PortalSession } from '../lib/auth'

const Tab  = createBottomTabNavigator()
const Stack = createStackNavigator()

/* ── Stack extra: Ponto, Ocorrências, etc. ── */
function HomeStack({ session }: { session: PortalSession }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {(props) => <HomeScreen {...props} session={session} />}
      </Stack.Screen>
      <Stack.Screen name="Ocorrencias">
        {() => <PlaceholderScreen title="Ocorrências" icon="warning-outline" color={theme.danger} />}
      </Stack.Screen>
      <Stack.Screen name="Producao">
        {() => <PlaceholderScreen title="Produção" icon="hammer-outline" color={theme.warning} />}
      </Stack.Screen>
      <Stack.Screen name="Solicitacoes">
        {() => <PlaceholderScreen title="Solicitações" icon="person-add-outline" color={theme.success} />}
      </Stack.Screen>
      <Stack.Screen name="Epis">
        {() => <PlaceholderScreen title="Solicitar EPI" icon="shield-checkmark-outline" color="#c2410c" />}
      </Stack.Screen>
      <Stack.Screen name="Documentos">
        {() => <PlaceholderScreen title="Documentos" icon="document-outline" color="#0369a1" />}
      </Stack.Screen>
      <Stack.Screen name="Playbook">
        {() => <PlaceholderScreen title="Playbook" icon="book-outline" color={theme.success} />}
      </Stack.Screen>
      <Stack.Screen name="VT">
        {() => <PlaceholderScreen title="Vale Transporte" icon="bus-outline" color={theme.purple} />}
      </Stack.Screen>
      <Stack.Screen name="Lancamentos">
        {() => <PlaceholderScreen title="Lançamentos" icon="time-outline" color="#ea580c" />}
      </Stack.Screen>
      <Stack.Screen name="Presenca">
        {() => <PlaceholderScreen title="Relatório de Presença" icon="stats-chart-outline" color={theme.primary} />}
      </Stack.Screen>
      <Stack.Screen name="Ponto">
        {() => <PontoScreen session={session} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

/* ── Tab principal ── */
export default function Navigation({
  session,
  onLogout,
}: {
  session: PortalSession
  onLogout: () => void
}) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: theme.border,
            paddingBottom: 6,
            height: 62,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textLight,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<string, [string, string]> = {
              'Início': ['home',         'home-outline'],
              'Ponto':  ['time',         'time-outline'],
              'Perfil': ['person-circle','person-circle-outline'],
            }
            const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline']
            return (
              <Ionicons
                name={(focused ? active : inactive) as any}
                size={size}
                color={color}
              />
            )
          },
        })}
      >
        <Tab.Screen name="Início">
          {(props) => <HomeStack {...props} session={session} />}
        </Tab.Screen>
        <Tab.Screen name="Ponto">
          {() => <PontoScreen session={session} />}
        </Tab.Screen>
        <Tab.Screen name="Perfil">
          {() => <PerfilScreen session={session} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  )
}
