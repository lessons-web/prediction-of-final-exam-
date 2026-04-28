import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type AuthUser = { username: string }

type AuthResult = { ok: true; user: AuthUser | null } | { ok: false; error: string }

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
  login: (username: string, password: string) => Promise<AuthResult>
  register: (username: string, email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function api<T>(path: string, init: RequestInit) {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  })
  const data = (await res.json()) as T
  return { res, data }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api<{ ok: boolean; user: AuthUser | null }>('/api/auth/me', {
          method: 'GET',
        })
        if (!cancelled) setUser(data.user ?? null)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api<{ ok: boolean; user: AuthUser | null }>('/api/auth/me', {
        method: 'GET',
      })
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    try {
      const { res, data } = await api<{ ok: boolean; user?: AuthUser; error?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        },
      )
      if (!res.ok || !data.ok) return { ok: false, error: data.error ?? 'LOGIN_FAILED' }
      setUser(data.user ?? null)
      return { ok: true, user: data.user ?? null }
    } catch {
      return { ok: false, error: 'NETWORK_ERROR' }
    }
  }, [])

  const register = useCallback(
    async (username: string, email: string, password: string): Promise<AuthResult> => {
      try {
        const { res, data } = await api<{ ok: boolean; user?: AuthUser; error?: string }>(
          '/api/auth/register',
          {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
          },
        )
        if (!res.ok || !data.ok) return { ok: false, error: data.error ?? 'REGISTER_FAILED' }
        setUser(data.user ?? null)
        return { ok: true, user: data.user ?? null }
      } catch {
        return { ok: false, error: 'NETWORK_ERROR' }
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST', body: '{}' })
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, refresh, login, register, logout }),
    [user, loading, refresh, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
