import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { API } from '../features/auth/services/auth-service'
import { useAuth } from '../features/auth/hooks/useAuth'

export const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams()
  const { persistToken, refreshMe } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        console.error('Error en Google OAuth:', error)
        window.location.href = '/login?error=' + encodeURIComponent(error)
        return
      }

      if (token) {
        console.log('🔍 Token recibido:', token.substring(0, 30) + '...')

        // ✅ GUARDAR token usando el AuthProvider
        persistToken(token)

        console.log('✅ Token guardado usando AuthProvider')

        try {
          // ✅ Refrescar usuario usando AuthProvider (ya maneja el token)
          await refreshMe()

          // Obtener el usuario actualizado para verificar el rol
          const { data: user } = await API.get('/auth/me')
          console.log('👤 Usuario:', user)

          if (user) {

            // ✅ Si es WORKSHOP_OWNER, verificar si tiene workshop
            if (user.role === 'WORKSHOP_OWNER') {
              try {
                const { data: workshopsData } = await API.get(
                  '/owner/workshops',
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                )

                console.log('🔧 Workshops:', workshopsData)

                // Si no tiene workshops, redirigir a crear uno
                if (!workshopsData || workshopsData.length === 0) {
                  console.log(
                    '➡️ Redirigiendo a create-workshop (no tiene talleres)'
                  )
                  window.location.href = '/create-workshop?firstTime=true'
                  return
                }

                // Si tiene workshops, ir al dashboard
                console.log('➡️ Redirigiendo a dashboard (tiene talleres)')
                window.location.href = '/dashboard'
              } catch (err) {
                console.error('Error al verificar workshops:', err)
                // Si hay error, asumir que no tiene y enviar a crear
                window.location.href = '/create-workshop?firstTime=true'
              }
            } else {
              // Si es USER, ir a home
              console.log('➡️ Redirigiendo a home (es USER)')
              window.location.href = '/home'
            }
          } else {
            console.error('❌ No se pudo obtener info del usuario')
            window.location.href = '/login?error=user_not_found'
          }
        } catch (err) {
          console.error('❌ Error al obtener usuario:', err)
          window.location.href = '/login'
        }
      } else {
        console.error('❌ No se recibió token en el callback')
        window.location.href = '/login?error=no_token'
      }
    }

    handleCallback()
  }, [searchParams, persistToken, refreshMe])

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
