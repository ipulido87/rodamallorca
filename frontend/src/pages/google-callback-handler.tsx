import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { API } from '../features/auth/services/auth-service'
import { useAuth } from '../features/auth/hooks/useAuth'

export const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { persistToken, refreshMe, user } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        navigate('/login?error=' + encodeURIComponent(error), { replace: true })
        return
      }

      if (!token) {
        navigate('/login?error=no_token', { replace: true })
        return
      }

      try {
        // ✅ GUARDAR token y refrescar usuario
        persistToken(token)
        await refreshMe()

        // ✅ El usuario ya está en el contexto después de refreshMe()
        // Hacer una llamada directa para obtener el usuario actualizado
        const { data: userData } = await API.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })

        if (!userData) {
          navigate('/login?error=user_not_found', { replace: true })
          return
        }

        // ✅ Si es USER normal, ir a home
        if (userData.role !== 'WORKSHOP_OWNER') {
          navigate('/home', { replace: true })
          return
        }

        // ✅ Si es WORKSHOP_OWNER, verificar workshops
        const { data: workshopsData } = await API.get('/owner/workshops/mine', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })

        if (Array.isArray(workshopsData) && workshopsData.length > 0) {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/create-workshop?firstTime=true', { replace: true })
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        navigate(
          '/login?error=' +
            encodeURIComponent('Error al iniciar sesión. Intenta de nuevo.'),
          { replace: true }
        )
      }
    }

    handleCallback()
  }, [searchParams, persistToken, refreshMe, navigate])

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
