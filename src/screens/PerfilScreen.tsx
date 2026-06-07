import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { logout, PortalSession } from '../lib/auth'
import { theme } from '../theme'

export default function PerfilScreen({
  session,
  onLogout,
}: {
  session: PortalSession
  onLogout: () => void
}) {
  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout()
          onLogout()
        },
      },
    ])
  }

  const inicial = (session.nome ?? session.login)[0]?.toUpperCase() ?? '?'

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false}>
      {/* ── Hero ── */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{inicial}</Text>
        </View>
        <Text style={s.nome}>{session.nome ?? session.login}</Text>
        <Text style={s.login}>@{session.login}</Text>
        <View style={s.badgeRow}>
          <View style={s.badge}>
            <Ionicons name="construct-outline" size={12} color={theme.primaryLight} />
            <Text style={s.badgeTxt}>
              {(session.obras_ids ?? []).length} obra
              {(session.obras_ids ?? []).length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={[s.badge, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="checkmark-circle" size={12} color={theme.success} />
            <Text style={[s.badgeTxt, { color: theme.success }]}>Ativo</Text>
          </View>
        </View>
      </View>

      {/* ── Obras com acesso ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Obras com Acesso</Text>
        {(session.obras_ids ?? []).length === 0 ? (
          <Text style={{ color: theme.textMuted, fontSize: 13 }}>
            Nenhuma obra vinculada
          </Text>
        ) : (
          (session.obras_ids ?? []).map((id) => (
            <View key={id} style={s.item}>
              <View style={s.itemIconWrap}>
                <Ionicons
                  name="construct-outline"
                  size={15}
                  color={theme.primary}
                />
              </View>
              <Text style={s.itemTxt}>{id}</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.textLight}
              />
            </View>
          ))
        )}
      </View>

      {/* ── Info da sessão ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Sessão</Text>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>ID do usuário</Text>
          <Text style={s.infoVal} numberOfLines={1}>
            {session.id.slice(0, 16)}…
          </Text>
        </View>
        <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={s.infoLabel}>Login</Text>
          <Text style={s.infoVal}>{session.login}</Text>
        </View>
      </View>

      {/* ── Botão logout ── */}
      <TouchableOpacity
        style={s.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.danger} />
        <Text style={s.logoutTxt}>Sair do Portal</Text>
      </TouchableOpacity>

      <Text style={s.version}>ConstrutorRH v1.0.0</Text>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    backgroundColor: theme.primary,
    alignItems: 'center',
    paddingVertical: 32,
    paddingTop: 56,
    paddingBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarTxt: { fontSize: 34, fontWeight: '800', color: '#fff' },
  nome: { fontSize: 20, fontWeight: '800', color: '#fff' },
  login: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primaryLight,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 14,
    padding: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  itemIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTxt: { fontSize: 13, color: theme.text, flex: 1 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoLabel: { fontSize: 13, color: theme.textMuted },
  infoVal: { fontSize: 13, color: theme.text, fontWeight: '600', maxWidth: '60%' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fef2f2',
    margin: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fecaca',
  },
  logoutTxt: { fontSize: 15, fontWeight: '700', color: theme.danger },
  version: {
    textAlign: 'center',
    fontSize: 10,
    color: theme.textLight,
    marginBottom: 24,
  },
})
