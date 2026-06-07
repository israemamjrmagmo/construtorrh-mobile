import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  AppState,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { PortalSession } from '../lib/auth'
import { theme } from '../theme'

export default function PontoScreen({ session }: { session: PortalSession }) {
  const [dados, setDados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const hoje = new Date().toISOString().slice(0, 10)

  const fetchData = useCallback(async () => {
    if (!session?.obras_ids?.length) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('portal_ponto_diario')
      .select(
        'colaborador_id, obra_id, hora_entrada, hora_saida, status, horas_trabalhadas, colaboradores(nome, chapa)'
      )
      .in('obra_id', session.obras_ids)
      .eq('data', hoje)
      .order('colaboradores(nome)')

    setDados(data ?? [])
    setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    setLoading(false)
  }, [session, hoje])

  /* ── Auto-refresh: 20s + foreground ── */
  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 20_000)
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') fetchData()
    })
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      sub.remove()
    }
  }, [fetchData])

  const presentes = dados.filter((d) => d.hora_entrada)
  const ausentes  = dados.filter((d) => !d.hora_entrada)

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false}>
      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <Text style={s.topTitle}>Ponto de Hoje</Text>
        <Text style={s.topDate}>
          {new Date().toLocaleDateString('pt-BR')}
        </Text>
      </View>

      {/* ── KPIs ── */}
      <View style={s.kpiRow}>
        <View style={[s.kpi, { backgroundColor: '#dcfce7' }]}>
          <Text style={[s.kpiVal, { color: theme.success }]}>
            {presentes.length}
          </Text>
          <Text style={[s.kpiLbl, { color: theme.success }]}>Presentes</Text>
        </View>
        <View style={[s.kpi, { backgroundColor: '#fee2e2' }]}>
          <Text style={[s.kpiVal, { color: theme.danger }]}>
            {ausentes.length}
          </Text>
          <Text style={[s.kpiLbl, { color: theme.danger }]}>Ausentes</Text>
        </View>
        <View style={[s.kpi, { backgroundColor: '#eff6ff' }]}>
          <Text style={[s.kpiVal, { color: theme.primaryLight }]}>
            {dados.length}
          </Text>
          <Text style={[s.kpiLbl, { color: theme.primaryLight }]}>Total</Text>
        </View>
      </View>

      {lastUpdate ? (
        <Text style={s.lastUpdate}>🔄 Atualizado às {lastUpdate}</Text>
      ) : null}

      {/* ── Lista ── */}
      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ margin: 24 }} />
      ) : (
        dados.map((d, i) => {
          const c = d.colaboradores as any
          const presente = !!d.hora_entrada
          return (
            <View
              key={i}
              style={[
                s.row,
                {
                  borderLeftColor: presente ? theme.success : theme.danger,
                  borderLeftWidth: 3,
                },
              ]}
            >
              <View
                style={[
                  s.dot,
                  { backgroundColor: presente ? theme.success : '#e2e8f0' },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.nome}>{c?.nome ?? '—'}</Text>
                <Text style={s.chapa}>{c?.chapa ?? ''}</Text>
              </View>
              {presente ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.hora}>{d.hora_entrada}</Text>
                  {d.hora_saida ? (
                    <Text style={[s.hora, { color: theme.textMuted }]}>
                      ↳ {d.hora_saida}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text
                  style={{ color: theme.danger, fontSize: 11, fontWeight: '700' }}
                >
                  Falta
                </Text>
              )}
            </View>
          )
        })
      )}

      {!loading && dados.length === 0 && (
        <View style={{ alignItems: 'center', padding: 40 }}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color={theme.textLight}
          />
          <Text style={{ color: theme.textMuted, marginTop: 12 }}>
            Nenhum registro hoje
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  topBar: {
    backgroundColor: theme.primary,
    padding: 20,
    paddingTop: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  topTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  topDate: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  kpiRow: { flexDirection: 'row', gap: 10, margin: 16 },
  kpi: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  kpiVal: { fontSize: 24, fontWeight: '900' },
  kpiLbl: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  lastUpdate: {
    textAlign: 'center',
    fontSize: 10,
    color: theme.textLight,
    marginBottom: 8,
  },
  row: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  nome: { fontWeight: '700', fontSize: 14, color: theme.text },
  chapa: { fontSize: 11, color: theme.textMuted },
  hora: { fontSize: 13, fontWeight: '700', color: theme.success },
})
