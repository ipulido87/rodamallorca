import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../auth/hooks/useAuth'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

/**
 * Component that verifies if the user has an active subscription
 * BEFORE rendering protected content.
 */
export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkSubscription = () => {
      if (!user) {
        setChecking(true)
        return
      }

      // Non-WORKSHOP_OWNER users have immediate access
      if (user.role !== 'WORKSHOP_OWNER') {
        setHasAccess(true)
        setChecking(false)
        return
      }

      // Redirect to create workshop if none exist
      if (!user.workshopsCount || user.workshopsCount === 0) {
        navigate('/create-workshop', { replace: true })
        setChecking(false)
        return
      }

      // Redirect to activate subscription if not active
      if (!user.hasActiveSubscription) {
        navigate('/activate-subscription', { replace: true })
        setChecking(false)
        return
      }

      // All checks passed - allow access
      setHasAccess(true)
      setChecking(false)
    }

    checkSubscription()
  }, [user, navigate])

  // Mostrar loading mientras verifica
  if (checking) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Verificando acceso...
        </Typography>
      </Box>
    )
  }

  // Si tiene acceso, renderizar contenido
  if (hasAccess) {
    return <>{children}</>
  }

  // No debería llegar aquí, pero por si acaso
  return null
}
