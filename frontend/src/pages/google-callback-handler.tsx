import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { API } from '@/shared/api'
import { useAuth } from '../features/auth/hooks/useAuth'
import type { User } from '../features/auth/providers/auth-providers'

export const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { persistToken, setUser } = useAuth()
  const { t } = useTranslation()

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

        // WORKSHOP_OWNER without active subscription
        if (!userData.hasActiveSubscription) {
          navigate('/activate-subscription', { replace: true })
          return
        }

        // With active subscription, check for workshops
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
      } catch {
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
        {t('callbacks.completingLogin')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {t('callbacks.verifyingWorkshops')}
      </Typography>
    </Box>
  )
}
