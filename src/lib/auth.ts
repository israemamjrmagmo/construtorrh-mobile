import * as Crypto from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'
import { supabase } from './supabase'

const SESSION_KEY = 'portal_session'

export interface PortalSession {
  id: string
  login: string
  nome: string
  obras_ids: string[]
}

export async function sha256(text: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    text
  )
  return hash
}

export async function loginPortal(
  login: string,
  senha: string
): Promise<{ session: PortalSession | null; error: string | null }> {
  try {
    const hash = await sha256(senha.trim())
    const loginLower = login.trim().toLowerCase()

    const { data, error } = await supabase
      .from('portal_usuarios')
      .select('id, login, nome, obras_ids, ativo, senha_hash')
      .eq('login', loginLower)
      .single()

    if (error || !data) return { session: null, error: 'Login não encontrado' }
    if (!data.ativo) return { session: null, error: 'Acesso bloqueado' }
    if (data.senha_hash !== hash) return { session: null, error: 'Senha incorreta' }

    const session: PortalSession = {
      id: data.id,
      login: data.login,
      nome: data.nome,
      obras_ids: data.obras_ids ?? [],
    }
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session))
    return { session, error: null }
  } catch (e: any) {
    return { session: null, error: e.message ?? 'Erro desconhecido' }
  }
}

export async function getSession(): Promise<PortalSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY)
}
