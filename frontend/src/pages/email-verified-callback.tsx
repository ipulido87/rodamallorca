import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { API } from '../features/auth/services/auth-service'
import { useAuth } from '../features/auth/hooks/useAuth'

export const EmailVerifiedCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { persistToken, setUser } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('📧 [EmailVerified] Iniciando callback handler')
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        console.log('❌ [EmailVerified] Error en URL, redirigiendo a login')
        navigate('/login?error=' + encodeURIComponent(error), { replace: true })
        return
      }

      if (!token) {
        console.log('❌ [EmailVerified] No hay token, redirigiendo a login')
        navigate('/login?error=no_token', { replace: true })
        return
      }

      try {
        // ✅ GUARDAR token
        console.log('📧 [EmailVerified] Guardando token...')
        persistToken(token)

        // ✅ Obtener datos del usuario
        console.log('📧 [EmailVerified] Obteniendo datos del usuario...')
        const { data: userData } = await API.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })

        console.log('📧 [EmailVerified] Usuario obtenido:', userData)

        if (!userData) {
          console.log('❌ [EmailVerified] Usuario no encontrado')
          navigate('/login?error=user_not_found', { replace: true })
          return
        }

        // ✅ ACTUALIZAR contexto de usuario
        console.log('📧 [EmailVerified] Actualizando contexto de usuario...')
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))

        // ✅ Si es USER normal, ir a home
        if (userData.role !== 'WORKSHOP_OWNER') {
          console.log('📧 [EmailVerified] Usuario normal, redirigiendo a /home')
          navigate('/home', { replace: true })
          return
        }

        // ✅ Si es WORKSHOP_OWNER, verificar workshops
        console.log('📧 [EmailVerified] WORKSHOP_OWNER, verificando talleres...')
        const { data: workshopsData } = await API.get('/owner/workshops/mine', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })

        console.log('📧 [EmailVerified] Talleres:', workshopsData)

        if (Array.isArray(workshopsData) && workshopsData.length > 0) {
          console.log('📧 [EmailVerified] Talleres encontrados, redirigiendo a /dashboard')
          navigate('/dashboard', { replace: true })
        } else {
          // ⭐ Sin talleres → CREAR WORKSHOP AUTOMÁTICO y redirigir a STRIPE
          console.log('📧 [EmailVerified] Sin talleres, creando workshop automático...')

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

            console.log('✅ [EmailVerified] Workshop creado:', newWorkshop)

            // Redirigir a pricing para que inicie checkout de Stripe
            console.log('📧 [EmailVerified] Redirigiendo a /pricing para suscripción...')
            navigate('/pricing?auto=true', { replace: true })
          } catch (createError) {
            console.error('❌ [EmailVerified] Error creando workshop:', createError)
            // Si falla, enviar a crear workshop manualmente
            navigate('/create-workshop?firstTime=true', { replace: true })
          }
        }
      } catch (err) {
        console.error('❌ [EmailVerified] Error en callback:', err)
        if (err instanceof Error) {
          console.error('❌ [EmailVerified] Error message:', err.message)
          console.error('❌ [EmailVerified] Error stack:', err.stack)
        }
        navigate(
          '/login?error=' +
            encodeURIComponent('Error al completar verificación. Intenta de nuevo.'),
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
        Verificando tu cuenta...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Preparando tu experiencia...
      </Typography>
    </Box>
  )
}
