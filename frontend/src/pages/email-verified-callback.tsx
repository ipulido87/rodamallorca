import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { API } from '@/shared/api'
import { useAuth } from '../features/auth/hooks/useAuth'
import type { User } from '../features/auth/providers/auth-providers'

export const EmailVerifiedCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { persistToken, setUser } = useAuth()

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
        persistToken(token)

        const { data: userData } = await API.get<User>('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })

        if (!userData) {
          navigate('/login?error=user_not_found', { replace: true })
          return
        }

        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))

        // Regular users go to home
        if (userData.role !== 'WORKSHOP_OWNER') {
          navigate('/home', { replace: true })
          return
        }

        // WORKSHOP_OWNER - check for existing workshops
        const { data: workshopsData } = await API.get('/owner/workshops/mine', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })

        if (Array.isArray(workshopsData) && workshopsData.length > 0) {
          navigate('/dashboard', { replace: true })
        } else {
          // No workshops - create one automatically
          try {
            await API.post(
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

            navigate('/pricing?auto=true', { replace: true })
          } catch {
            navigate('/create-workshop?firstTime=true', { replace: true })
          }
        }
      } catch {
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
