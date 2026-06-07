import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'

interface Props {
  route?: { name?: string }
  title?: string
  icon?: string
  color?: string
}

export default function PlaceholderScreen({ route, title, icon = 'construct-outline', color = theme.primary }: Props) {
  const screenTitle = title ?? route?.name ?? 'Em breve'
  return (
    <View style={s.root}>
      <View style={[s.iconBox, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={52} color={color} />
      </View>
      <Text style={s.title}>{screenTitle}</Text>
      <Text style={s.sub}>Funcionalidade em desenvolvimento</Text>
      <View style={s.pill}>
        <Text style={s.pillTxt}>🚧 Em breve</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconBox: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 8 },
  sub: { fontSize: 14, color: theme.textMuted, textAlign: 'center' },
  pill: { marginTop: 20, backgroundColor: '#fffbeb', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#fde68a' },
  pillTxt: { fontSize: 12, fontWeight: '700', color: theme.warning },
})
