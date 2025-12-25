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

      console.log('🔍 [CALLBACK] Token:', token ? 'SÍ' : 'NO')
      console.log('🔍 [CALLBACK] Error:', error)

      if (error) {
        console.error('❌ Error en Google OAuth:', error)
        window.location.href = '/login?error=' + encodeURIComponent(error)
        return
      }

      if (!token) {
        console.error('❌ No se recibió token en el callback')
        window.location.href = '/login?error=no_token'
        return
      }

      try {
        console.log('🔍 Token recibido:', token.substring(0, 30) + '...')

        // ✅ GUARDAR token
        persistToken(token)
        console.log('✅ Token guardado')

        // ✅ Refrescar usuario
        await refreshMe()
        console.log('✅ Usuario refrescado')

        // Obtener info del usuario
        const { data: user } = await API.get('/auth/me')
        console.log('👤 Usuario obtenido:', user?.email, user?.role)

        if (!user) {
          console.error('❌ No se pudo obtener usuario')
          window.location.href = '/login?error=user_not_found'
          return
        }

        // ✅ Si es USER normal, ir a home
        if (user.role !== 'WORKSHOP_OWNER') {
          console.log('➡️ USER normal → /home')
          window.location.href = '/home'
          return
        }

        // ✅ Si es WORKSHOP_OWNER, verificar workshops
        console.log('🔍 Verificando workshops...')
        const { data: workshopsData } = await API.get('/owner/workshops/mine', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })

        console.log('🔧 Workshops:', workshopsData)
        console.log('🔧 Es array:', Array.isArray(workshopsData))
        console.log('🔧 Cantidad:', workshopsData?.length)

        if (Array.isArray(workshopsData) && workshopsData.length > 0) {
          console.log('✅ Tiene workshops → /dashboard')
          window.location.href = '/dashboard'
        } else {
          console.log('⚠️ No tiene workshops → /create-workshop')
          window.location.href = '/create-workshop?firstTime=true'
        }
      } catch (err) {
        console.error('❌ ERROR EN CALLBACK:', err)
        console.error('❌ Error completo:', JSON.stringify(err, null, 2))
        // NO redirigir automáticamente, mostrar error
        alert('Error al procesar login: ' + (err instanceof Error ? err.message : 'Error desconocido'))
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
