import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext, User } from '../features/auth/providers/auth-providers'
import {
  API,
  login as apiLogin,
  me as apiMe,
  register as apiRegister,
  verifyCode as apiVerifyCode,
} from '../features/auth/services/auth-service'

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
      // Si falla /me, también limpia el token inválido
      persistToken(null)
    }
  }, [persistToken])

  // Carga inicial: si hay token o cookie httpOnly, intenta hidratar /me
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        // Siempre intentar refreshMe por si hay cookie httpOnly o session del login con Google
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

  const logout = useCallback(async () => {
    try {
      // Llamar al backend para limpiar cookies
      await API.post('/auth/logout')
    } catch (error) {
      console.warn('Backend logout failed:', error)
    }

    // Limpiar estado local
    persistToken(null)
    setUser(null)

    // Forzar redirección para asegurar que sale de rutas protegidas
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }, [persistToken])

  const register = useCallback(
    async (input: {
      email: string
      password: string
      name: string
      birthDate?: string
      phone?: string
      role?: 'USER' | 'WORKSHOP_OWNER'
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

  // Auto-logout por inactividad
  useEffect(() => {
    if (!user) return // Solo si está autenticado

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutos
    let timeoutId: number

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        logout()
        alert('Sesión cerrada por inactividad (30 minutos)')
      }, INACTIVITY_TIMEOUT)
    }

    // Eventos que resetean el timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]

    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, true)
    })

    resetTimeout() // Iniciar el timer

    return () => {
      clearTimeout(timeoutId)
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout, true)
      })
    }
  }, [user, logout]) // Dependencias: user y logout

  const value = useMemo(
    () => ({
      token,
      user,
      // FIX: Para Google OAuth el token está en cookies, no localStorage
      // Si hay user, está autenticado (independientemente del token local)
      isAuthenticated: !!user,
      isWorkshopOwner: user?.role === 'WORKSHOP_OWNER',
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
