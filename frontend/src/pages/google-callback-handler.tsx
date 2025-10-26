import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { API } from '../features/auth/services/auth-service'

export const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams()

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

        // ✅ GUARDAR token en localStorage
        localStorage.setItem('token', token)

        const saved = localStorage.getItem('token')
        console.log('✅ Token guardado en localStorage:', saved ? 'SÍ' : 'NO')

        try {
          // ✅ Obtener info del usuario
          const { data } = await API.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const user = data?.user
          console.log('👤 Usuario:', user)

          if (user) {
            // Guardar usuario en localStorage
            localStorage.setItem('user', JSON.stringify(user))

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
  }, [searchParams])

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
