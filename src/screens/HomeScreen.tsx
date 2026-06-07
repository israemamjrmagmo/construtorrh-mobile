import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  AppState,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { PortalSession } from '../lib/auth'
import { theme } from '../theme'

interface ObraInfo {
  id: string
  nome: string
  codigo?: string
}

const ACOES = [
  { icon: 'clipboard-outline',       label: 'Lançar Ponto',   sub: 'Presenças',    cor: theme.primaryLight, bg: '#eff6ff',  screen: 'Ponto'        },
  { icon: 'warning-outline',         label: 'Ocorrência',     sub: 'Registrar',    cor: theme.danger,       bg: '#fef2f2',  screen: 'Ocorrencias'  },
  { icon: 'hammer-outline',          label: 'Produção',        sub: 'Ficha diária', cor: theme.warning,      bg: '#fffbeb',  screen: 'Producao'     },
  { icon: 'person-add-outline',      label: 'Solicitação',    sub: 'Cadastros',    cor: theme.success,      bg: '#f0fdf4',  screen: 'Solicitacoes' },
  { icon: 'shield-checkmark-outline',label: 'Solicitar EPI',  sub: 'Equipamentos', cor: '#c2410c',          bg: '#fff7ed',  screen: 'Epis'         },
  { icon: 'document-outline',        label: 'Documentos',     sub: 'Arquivos',     cor: '#0369a1',          bg: '#f0f9ff',  screen: 'Documentos'   },
  { icon: 'book-outline',            label: 'Playbook',       sub: 'Serviços',     cor: theme.success,      bg: '#f0fdf4',  screen: 'Playbook'     },
  { icon: 'bus-outline',             label: 'Vale Transp.',   sub: 'Histórico',    cor: theme.purple,       bg: '#f5f3ff',  screen: 'VT'           },
  { icon: 'time-outline',            label: 'Lançamentos',    sub: 'Mensal',       cor: '#ea580c',          bg: '#fff7ed',  screen: 'Lancamentos'  },
  { icon: 'stats-chart-outline',     label: 'Presença',       sub: 'Relatório',    cor: theme.primary,      bg: '#eff6ff',  screen: 'Presenca'     },
]

export default function HomeScreen({
  session,
  navigation,
}: {
  session: PortalSession
  navigation: any
}) {
  const [obras, setObras] = useState<ObraInfo[]>([])
  const [contadores, setContadores] = useState<
    Record<string, { ponto: number; ocorr: number }>
  >({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const hoje = new Date().toISOString().slice(0, 10)

  const fetchData = useCallback(async () => {
    if (!session?.obras_ids?.length) {
      setLoading(false)
      return
    }
    const ids = session.obras_ids

    const [{ data: obsData }, { data: pontosHoje }, { data: ocorrHoje }] =
      await Promise.all([
        supabase
          .from('obras')
          .select('id,nome,codigo')
          .in('id', ids)
          .order('nome'),
        supabase
          .from('portal_ponto_diario')
          .select('obra_id')
          .in('obra_id', ids)
          .eq('data', hoje),
        supabase
          .from('portal_ocorrencias')
          .select('obra_id')
          .in('obra_id', ids)
          .eq('data', hoje),
      ])

    if (obsData) setObras(obsData)

    const cnt: Record<string, { ponto: number; ocorr: number }> = {}
    ids.forEach((id) => { cnt[id] = { ponto: 0, ocorr: 0 } })
    pontosHoje?.forEach((r: any) => { if (cnt[r.obra_id]) cnt[r.obra_id].ponto++ })
    ocorrHoje?.forEach((r: any)  => { if (cnt[r.obra_id]) cnt[r.obra_id].ocorr++ })

    setContadores(cnt)
    setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    setLoading(false)
  }, [session, hoje])

  /* ── Auto-refresh: 30s + volta ao foreground ── */
  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 30_000)
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchData()
    })
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      sub.remove()
    }
  }, [fetchData])

  const primeiroNome = (session.nome ?? session.login).split(' ')[0]
  const dataFmt = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.dataText}>{dataFmt}</Text>
          <Text style={s.greeting}>Olá, {primeiroNome}! 👋</Text>
          <Text style={s.subGreeting}>
            {obras.length} obra{obras.length !== 1 ? 's' : ''} ativa
            {obras.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={s.avatarBox}>
          <Text style={s.avatarText}>{primeiroNome[0]?.toUpperCase()}</Text>
        </View>
      </View>

      {/* ── Cards de obras ── */}
      {loading ? (
        <ActivityIndicator
          color={theme.primary}
          style={{ marginVertical: 20 }}
        />
      ) : (
        obras.map((o) => {
          const cnt = contadores[o.id] ?? { ponto: 0, ocorr: 0 }
          return (
            <View key={o.id} style={s.obraCard}>
              <View style={s.obraIcon}>
                <Ionicons name="construct" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.obraNome} numberOfLines={1}>
                  {o.nome}
                </Text>
                {o.codigo ? (
                  <Text style={s.obraCod}>{o.codigo}</Text>
                ) : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {cnt.ponto > 0 && (
                  <View style={[s.badge, { backgroundColor: '#dcfce7' }]}>
                    <Text style={[s.badgeTxt, { color: theme.success }]}>
                      ✓ {cnt.ponto}
                    </Text>
                  </View>
                )}
                {cnt.ocorr > 0 && (
                  <View style={[s.badge, { backgroundColor: '#fee2e2' }]}>
                    <Text style={[s.badgeTxt, { color: theme.danger }]}>
                      ⚠ {cnt.ocorr}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )
        })
      )}

      {!loading && obras.length === 0 && (
        <View style={s.emptyObras}>
          <Ionicons name="construct-outline" size={40} color={theme.textLight} />
          <Text style={{ color: theme.textMuted, marginTop: 8, fontSize: 13 }}>
            Nenhuma obra vinculada
          </Text>
        </View>
      )}

      {/* ── Menu rápido ── */}
      <Text style={s.sectionTitle}>Menu Rápido</Text>
      <View style={s.grid}>
        {ACOES.map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[s.acao, { backgroundColor: a.bg }]}
            onPress={() => {
              try { navigation.navigate(a.screen) } catch {}
            }}
            activeOpacity={0.75}
          >
            <View
              style={[s.acaoIcon, { backgroundColor: a.cor + '22' }]}
            >
              <Ionicons name={a.icon as any} size={24} color={a.cor} />
            </View>
            <Text style={[s.acaoLabel, { color: a.cor }]}>{a.label}</Text>
            <Text style={s.acaoSub}>{a.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Rodapé ── */}
      {lastUpdate ? (
        <Text style={s.footer}>🔄 Atualizado às {lastUpdate}</Text>
      ) : (
        <Text style={s.footer}>🔄 Atualiza automaticamente a cada 30s</Text>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: theme.primary,
    padding: 20,
    paddingTop: 56,
  },
  dataText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'capitalize',
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  subGreeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  obraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    elevation: 1,
  },
  obraIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obraNome: { fontWeight: '700', fontSize: 13, color: theme.text },
  obraCod: { fontSize: 10, color: theme.textMuted },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeTxt: { fontSize: 10, fontWeight: '700' },
  emptyObras: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.textMuted,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  acao: {
    width: '46.5%',
    marginHorizontal: '1.75%',
    borderRadius: 14,
    padding: 14,
    elevation: 1,
  },
  acaoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  acaoLabel: { fontSize: 13, fontWeight: '700' },
  acaoSub: { fontSize: 10, color: theme.textMuted, marginTop: 2 },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: theme.textLight,
    marginTop: 24,
  },
})
