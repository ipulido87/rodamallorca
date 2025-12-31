import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { API } from '../features/auth/services/auth-service'
import { useAuth } from '../features/auth/hooks/useAuth'

export const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { persistToken, setUser } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔐 [GoogleCallback] Iniciando callback handler')
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      console.log('🔐 [GoogleCallback] Token recibido:', token ? '✅' : '❌')
      console.log('🔐 [GoogleCallback] Error recibido:', error || 'ninguno')

      if (error) {
        console.log('❌ [GoogleCallback] Error en URL, redirigiendo a login')
        navigate('/login?error=' + encodeURIComponent(error), { replace: true })
        return
      }

      if (!token) {
        console.log('❌ [GoogleCallback] No hay token, redirigiendo a login')
        navigate('/login?error=no_token', { replace: true })
        return
      }

      try {
        // ✅ GUARDAR token
        console.log('🔐 [GoogleCallback] Guardando token...')
        persistToken(token)

        // ✅ Obtener datos del usuario directamente (no llamar refreshMe para evitar 401)
        console.log('🔐 [GoogleCallback] Obteniendo datos del usuario...')
        const { data: userData } = await API.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })

        console.log('🔐 [GoogleCallback] Usuario obtenido:', userData)

        if (!userData) {
          console.log('❌ [GoogleCallback] Usuario no encontrado')
          navigate('/login?error=user_not_found', { replace: true })
          return
        }

        // ✅ ACTUALIZAR contexto de usuario (CRÍTICO para que PrivateRoute no redirija a login)
        console.log('🔐 [GoogleCallback] Actualizando contexto de usuario...')
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))

        // ✅ Si es USER normal, ir a home
        if (userData.role !== 'WORKSHOP_OWNER') {
          console.log('🔐 [GoogleCallback] Usuario normal, redirigiendo a /home')
          navigate('/home', { replace: true })
          return
        }

        // ✅ Si es WORKSHOP_OWNER, verificar workshops
        console.log('🔐 [GoogleCallback] WORKSHOP_OWNER, verificando talleres...')
        const { data: workshopsData } = await API.get('/owner/workshops/mine', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })

        console.log('🔐 [GoogleCallback] Talleres:', workshopsData)

        if (Array.isArray(workshopsData) && workshopsData.length > 0) {
          console.log('🔐 [GoogleCallback] Talleres encontrados, redirigiendo a /dashboard')
          navigate('/dashboard', { replace: true })
        } else {
          // ⭐ Sin talleres → CREAR WORKSHOP AUTOMÁTICO y redirigir a STRIPE
          console.log('🔐 [GoogleCallback] Sin talleres, creando workshop automático...')

          try {
            // Crear workshop con nombre por defecto
            const { data: newWorkshop } = await API.post(
              '/owner/workshops',
              {
                name: `Taller de ${userData.email.split('@')[0]}`,
                description: 'Taller creado automáticamente',
                address: '',
                city: '',
                country: 'ES',
                phone: '',
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )

            console.log('✅ [GoogleCallback] Workshop creado:', newWorkshop)

            // Redirigir a pricing para que inicie checkout de Stripe
            console.log('🔐 [GoogleCallback] Redirigiendo a /pricing para suscripción...')
            navigate('/pricing?auto=true', { replace: true })
          } catch (createError) {
            console.error('❌ [GoogleCallback] Error creando workshop:', createError)
            // Si falla, enviar a crear workshop manualmente
            navigate('/create-workshop?firstTime=true', { replace: true })
          }
        }
      } catch (err) {
        console.error('❌ [GoogleCallback] Error en callback:', err)
        if (err instanceof Error) {
          console.error('❌ [GoogleCallback] Error message:', err.message)
          console.error('❌ [GoogleCallback] Error stack:', err.stack)
        }
        navigate(
          '/login?error=' +
            encodeURIComponent('Error al iniciar sesión. Intenta de nuevo.'),
          { replace: true }
        )
      }
    }

    handleCallback()
  }, [searchParams, persistToken, setUser, navigate])

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completando inicio de sesión...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Verificando talleres...
      </Typography>
    </Box>
  )
}
