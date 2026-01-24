import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AxiosError } from 'axios'
import { AuthContext } from '../features/auth/providers/auth-providers'
import type { User, AuthContextType } from '../features/auth/providers/auth-providers'
import {
  API,
  login as apiLogin,
  me as apiMe,
  register as apiRegister,
  verifyCode as apiVerifyCode,
  resendVerification as apiResendVerification, // ✅ AGREGAR
} from '../features/auth/services/auth-service'
import { notify } from '../shared/services/notification-service'

// Key para localStorage
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

// ✅ HELPER PARA MANEJAR ERRORES DE API
const handleApiError = (error: unknown): string => {
  const axiosError = error as AxiosError<{
    error?: string
    message?: string
    errors?: Array<{ message: string }>
  }>

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message
  }

  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error
  }

  if (axiosError.response?.data?.errors?.[0]?.message) {
    return axiosError.response.data.errors[0].message
  }

  return axiosError.message || 'Error de conexión'
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  )
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null) // ✅ ERROR CENTRALIZADO

  // ✅ Declarar persistToken ANTES de usarlo en useEffect
  const persistToken = useCallback((t: string | null) => {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t)
      setToken(t)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    }
  }, [])

  // ---- Interceptor: adjunta Authorization si hay token ----
  useEffect(() => {
    // Rutas públicas que NO necesitan Authorization header
    const publicRoutes = [
      '/catalog/',
      '/service-categories',
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password'
    ]

    // ⭐ INTERCEPTOR DE REQUEST: BLOQUEAR PETICIONES SIN SUSCRIPCIÓN
    const reqId = API.interceptors.request.use((config) => {
      const requestUrl = config.url || ''

      // ✅ Verificar si es una ruta pública (pero NO si contiene /owner/ o /admin/)
      const isOwnerOrAdminRoute = requestUrl.includes('/owner/') || requestUrl.includes('/admin/')
      const isPublicRoute = !isOwnerOrAdminRoute && publicRoutes.some(route => requestUrl.includes(route))

      // ⭐ Rutas de owner que SÍ deben funcionar SIN suscripción activa
      const allowedWithoutSubscription = [
        '/subscriptions/create-checkout-session',  // Crear sesión de pago de Stripe
        '/subscriptions/status',                    // Verificar estado de suscripción
        '/auth/me',                                 // Obtener datos del usuario
      ]

      // ⭐ Verificar /workshops SOLO para POST (crear) o GET simple (listar propios)
      const isWorkshopsRoute = requestUrl.includes('/workshops')
      const isWorkshopsAllowed = isWorkshopsRoute && (
        config.method === 'post' ||  // Crear workshop
        requestUrl === '/owner/workshops' ||  // Listar mis workshops
        requestUrl.includes('/owner/workshops/mine')  // Listar mis workshops
      )

      // ⭐ BLOQUEAR peticiones a rutas de owner si es taller sin suscripción
      if (isOwnerOrAdminRoute) {
        // ✅ Verificar si es una ruta permitida sin suscripción
        const isAllowedRoute = allowedWithoutSubscription.some(route =>
          requestUrl.includes(route)
        ) || isWorkshopsAllowed

        if (!isAllowedRoute) {
          const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null')

          if (currentUser?.role === 'WORKSHOP_OWNER') {
            const hasActiveSubscription = currentUser.hasActiveSubscription

            if (!hasActiveSubscription) {
              console.log('🚫 [REQUEST INTERCEPTOR] Bloqueando petición a', requestUrl, '- sin suscripción activa')

              // ⭐ SOLO cancelar la petición, SIN redirigir (el RoleRoute ya redirige)
              return Promise.reject({
                message: 'Subscription required',
                isSubscriptionRequired: true,
                blocked: true
              })
            }
          }
        } else {
          console.log('✅ [REQUEST INTERCEPTOR] Permitiendo petición a', requestUrl, '- ruta permitida sin suscripción')
        }
      }

      // ✅ Leer token DIRECTAMENTE de localStorage (no del estado que puede estar desactualizado)
      const currentToken = localStorage.getItem(TOKEN_KEY)

      // Solo agregar Authorization a rutas NO públicas
      if (currentToken && config.headers && !isPublicRoute) {
        config.headers.Authorization = `Bearer ${currentToken}`
      }
      return config
    })

    // ---- Interceptor de respuesta: maneja 401 (token expirado) ----
    const resId = API.interceptors.response.use(
      (response) => response,
      (error) => {
        const requestUrl = error.config?.url || ''

        // ✅ Verificar si es una ruta pública (pero NO si contiene /owner/ o /admin/)
        const isOwnerOrAdminRoute = requestUrl.includes('/owner/') || requestUrl.includes('/admin/')
        const isPublicRoute = !isOwnerOrAdminRoute && publicRoutes.some(route => requestUrl.includes(route))

        // ✅ NO redirigir si estamos en el callback de OAuth o en checkout success
        const isInOAuthCallback = window.location.pathname === '/auth/callback'
        const isInCheckoutFlow = window.location.pathname.includes('/checkout/')

        // Si el token expiró en una ruta PRIVADA, hacer logout automático
        if (error.response?.status === 401 && token && !isPublicRoute && !isInOAuthCallback) {
          console.warn('⚠️ [INTERCEPTOR] Token expirado o inválido (401)')

          // Limpiar token y datos de usuario
          persistToken(null)
          setUser(null)
          localStorage.removeItem(USER_KEY)

          // Si estamos en checkout, NO forzar redirect - dejar que PrivateRoute lo maneje
          if (!isInCheckoutFlow) {
            console.warn('🔄 [INTERCEPTOR] Redirigiendo a login...')
            window.location.href = '/login?error=Sesión expirada, por favor inicia sesión nuevamente'
          } else {
            console.warn('⏭️ [INTERCEPTOR] En checkout flow, dejando que PrivateRoute maneje el redirect')
          }
        }
        return Promise.reject(error)
      }
    )

    return () => {
      API.interceptors.request.eject(reqId)
      API.interceptors.response.eject(resId)
    }
  }, [token, persistToken])

  const refreshMe = useCallback(async () => {
    console.log('🔄 [AUTH] refreshMe() iniciado')
    try {
      const fetchedUser = await apiMe() // ✅ apiMe() retorna el usuario directamente, no { user: {...} }
      console.log('✅ [AUTH] Usuario obtenido:', fetchedUser ? fetchedUser.email : 'null')
      setUser(fetchedUser ?? null)
      if (fetchedUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(fetchedUser))
      } else {
        localStorage.removeItem(USER_KEY)
      }
      setAuthError(null)
    } catch (error: any) {
      console.error('❌ [AUTH] Error en refreshMe():', error)

      // Si es 401 (token inválido/expirado), limpiar todo inmediatamente
      if (error.response?.status === 401) {
        console.warn('⚠️ [AUTH] Token inválido o expirado, limpiando sesión...')
        setUser(null)
        localStorage.removeItem(USER_KEY)
        persistToken(null)
        // No redirigir aquí - dejar que PrivateRoute lo maneje
      } else {
        // Otros errores (red, servidor, etc.) - limpiar también
        console.warn('⚠️ [AUTH] Error de autenticación, limpiando sesión...')
        setUser(null)
        localStorage.removeItem(USER_KEY)
        persistToken(null)
      }
    } finally {
      console.log('🏁 [AUTH] refreshMe() completado')
    }
  }, [persistToken])

  // Carga inicial con timeout de seguridad
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    ;(async () => {
      setLoading(true)
      console.log('🚀 [AUTH] Iniciando carga inicial de usuario...')

      // Timeout de seguridad: 8 segundos máximo
      timeoutId = setTimeout(() => {
        console.error('⏰ [AUTH] TIMEOUT: refreshMe() tardó más de 8 segundos')
        setLoading(false)
        setAuthError('La verificación de sesión tardó demasiado. Por favor, recarga la página.')
      }, 8000)

      try {
        await refreshMe()
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('❌ [AUTH] Error en carga inicial:', error)
        clearTimeout(timeoutId)
      } finally {
        setLoading(false)
        console.log('🏁 [AUTH] Carga inicial completada')
      }
    })()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [refreshMe])

  // ✅ LOGIN MEJORADO - RETORNA DATOS DEL USUARIO DIRECTAMENTE
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setAuthError(null)

      try {
        const { token: newToken, user: u } = await apiLogin(email, password)
        persistToken(newToken)

        // ⭐ Llamar a /auth/me para obtener datos completos incluyendo hasActiveSubscription
        const fullUser = await apiMe()
        setUser(fullUser ?? null)
        if (fullUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(fullUser))
        }

        // ⭐ RETORNAR el usuario para uso inmediato
        return fullUser
      } catch (error: unknown) {
        console.error('Login error in AuthProvider:', error)

        const errorMessage = handleApiError(error)
        const axiosError = error as AxiosError<{ error?: string }>

        // ✅ MANEJAR ERROR DE EMAIL NO VERIFICADO
        if (
          axiosError.response?.status === 403 &&
          axiosError.response?.data?.error === 'EMAIL_NOT_VERIFIED'
        ) {
          setAuthError(errorMessage)
          throw new Error(`EMAIL_NOT_VERIFIED:${email}`)
        }

        // ✅ MANEJAR ERROR DE CREDENCIALES INVÁLIDAS
        if (
          axiosError.response?.status === 401 &&
          axiosError.response?.data?.error === 'INVALID_CREDENTIALS'
        ) {
          setAuthError(errorMessage)
          throw new Error(errorMessage)
        }

        setAuthError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [persistToken]
  )

  // ✅ NUEVA FUNCIÓN PARA REENVIAR VERIFICACIÓN
  const resendVerification = useCallback(async (email: string) => {
    setLoading(true)
    setAuthError(null)

    try {
      await apiResendVerification(email)
      setAuthError(
        '✅ Email de verificación reenviado. Revisa tu bandeja de entrada.'
      )
    } catch (error: unknown) {
      const errorMessage = handleApiError(error)
      setAuthError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout')
    } catch (error) {
      console.warn('Backend logout failed:', error)
    }

    persistToken(null)
    setUser(null)
    setAuthError(null)
    localStorage.removeItem(USER_KEY)

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
      setLoading(true)
      setAuthError(null)

      try {
        await apiRegister(input)
        setAuthError(null)
      } catch (error: unknown) {
        const errorMessage = handleApiError(error)
        setAuthError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const verifyCode = useCallback(async (email: string, code: string) => {
    setLoading(true)
    setAuthError(null)

    try {
      await apiVerifyCode(email, code)
      setAuthError(null)
    } catch (error: unknown) {
      const errorMessage = handleApiError(error)
      setAuthError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ FUNCIÓN PARA LIMPIAR ERRORES
  const clearError = useCallback(() => {
    setAuthError(null)
  }, [])

  // Auto-logout por inactividad
  useEffect(() => {
    if (!user) return

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000
    let timeoutId: NodeJS.Timeout

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        notify.warning('Sesión cerrada por inactividad (30 minutos)')
        logout()
      }, INACTIVITY_TIMEOUT)
    }

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

    resetTimeout()

    return () => {
      clearTimeout(timeoutId)
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout, true)
      })
    }
  }, [user, logout])

  const value: AuthContextType = useMemo(
    () => ({
      token,
      user,
      setUser, // ✅ Exponer setUser para callback handler
      isAuthenticated: !!user,
      isWorkshopOwner: user?.role === 'WORKSHOP_OWNER',
      loading,
      authError,
      login,
      logout,
      register,
      verifyCode,
      resendVerification,
      refreshMe,
      persistToken,
      clearError,
    }),
    [
      token,
      user,
      loading,
      authError,
      login,
      logout,
      register,
      verifyCode,
      resendVerification,
      refreshMe,
      persistToken,
      clearError,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
