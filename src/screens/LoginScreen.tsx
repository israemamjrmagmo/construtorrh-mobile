import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { loginPortal } from '../lib/auth'
import { theme } from '../theme'

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin() {
    if (!login.trim() || !senha.trim()) {
      setErro('Preencha login e senha')
      return
    }
    setLoading(true)
    setErro('')
    const { error } = await loginPortal(login, senha)
    setLoading(false)
    if (error) {
      setErro(error)
      return
    }
    onLogin()
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={s.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

        {/* ── Header / Hero ── */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Ionicons name="construct" size={40} color="#fff" />
          </View>
          <Text style={s.appName}>ConstrutorRH</Text>
          <Text style={s.appSub}>Portal do Encarregado</Text>
        </View>

        {/* ── Card de login ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Acesso ao Portal</Text>

          {/* Campo Login */}
          <View style={s.inputWrap}>
            <Ionicons
              name="person-outline"
              size={18}
              color={theme.textMuted}
              style={s.inputIcon}
            />
            <TextInput
              style={s.input}
              placeholder="Login ou CPF"
              placeholderTextColor={theme.textLight}
              value={login}
              onChangeText={setLogin}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Campo Senha */}
          <View style={s.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={theme.textMuted}
              style={s.inputIcon}
            />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Senha"
              placeholderTextColor={theme.textLight}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowSenha((v) => !v)}
              style={{ padding: 8 }}
            >
              <Ionicons
                name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={theme.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Mensagem de erro */}
          {!!erro && (
            <View style={s.erroBox}>
              <Ionicons name="alert-circle" size={14} color={theme.danger} />
              <Text style={s.erroText}>{erro}</Text>
            </View>
          )}

          {/* Botão Entrar */}
          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Text style={s.hint}>Acesso liberado pelo gestor da empresa</Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.primary },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  appSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 24,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  inputIcon: { padding: 10 },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: theme.text,
    paddingHorizontal: 4,
  },
  erroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  erroText: { color: theme.danger, fontSize: 13, flex: 1 },
  btn: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    color: theme.textLight,
    marginTop: 16,
  },
})
