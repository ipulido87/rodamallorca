import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext, User } from '../contexts/auth-context'
import {
  API,
  login as apiLogin,
  me as apiMe,
  register as apiRegister,
  verifyCode as apiVerifyCode,
} from '../services/auth-service'

// Key para localStorage
const TOKEN_KEY = 'token'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  )
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ---- Interceptor: adjunta Authorization si hay token ----
  useEffect(() => {
    const id = API.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
    return () => API.interceptors.request.eject(id)
  }, [token])

  const persistToken = useCallback((t: string | null) => {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t)
      setToken(t)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    }
  }, [])

  const refreshMe = useCallback(async () => {
    try {
      const data = await apiMe()
      setUser(data?.user ?? null)
    } catch {
      setUser(null)
    }
  }, [])

  // Carga inicial: si hay token o cookie httpOnly, intenta hidratar /me
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        await refreshMe()
      } finally {
        setLoading(false)
      }
    })()
  }, [refreshMe])

  const login = useCallback(
    async (email: string, password: string) => {
      const { token: newToken, user: u } = await apiLogin(email, password)
      persistToken(newToken)
      setUser(u ?? null)
    },
    [persistToken]
  )

  const logout = useCallback(() => {
    persistToken(null)
    setUser(null)
    // opcional: llamar a /auth/logout si limpias cookie en backend
  }, [persistToken])

  const register = useCallback(
    async (input: {
      email: string
      password: string
      name: string
      birthDate?: string
      phone?: string
      role?: 'USER' | 'WORKSHOP_OWNER' // AGREGAR ESTO
    }) => {
      await apiRegister(input)
      // no seteamos token todavía; el user verificará su email
    },
    []
  )

  const verifyCode = useCallback(async (email: string, code: string) => {
    await apiVerifyCode(email, code)
    // tras verificar puedes redirigir a /login desde el componente
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated:
        !!user && (!!token || true) /* si trabajas con cookie httpOnly */,
      isWorkshopOwner: user?.role === 'WORKSHOP_OWNER', // AGREGAR ESTA LÍNEA
      loading,
      login,
      logout,
      register,
      verifyCode,
      refreshMe,
    }),
    [token, user, loading, login, logout, register, verifyCode, refreshMe]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
