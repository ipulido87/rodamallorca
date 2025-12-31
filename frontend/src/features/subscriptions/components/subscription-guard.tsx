import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../auth/hooks/useAuth'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  status?: string
  workshopId?: string
}

/**
 * Componente que verifica si el usuario tiene suscripción activa
 * ANTES de renderizar contenido protegido.
 *
 * Evita el flash de contenido y peticiones fallidas.
 */
export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkSubscription = () => {
      // Si no hay usuario, esperar
      if (!user) {
        setChecking(true)
        return
      }

      // Si no es WORKSHOP_OWNER, permitir acceso inmediatamente
      if (user.role !== 'WORKSHOP_OWNER') {
        setHasAccess(true)
        setChecking(false)
        return
      }

      // ⭐ Usar datos que vienen del /auth/me (sin peticiones adicionales)
      const userWithSub = user as any

      // Si no tiene talleres, redirigir a crear
      if (!userWithSub.workshopsCount || userWithSub.workshopsCount === 0) {
        console.log('🔒 [SubscriptionGuard] Sin talleres, redirigiendo a crear...')
        navigate('/create-workshop', { replace: true })
        setChecking(false)
        return
      }

      // Si no tiene suscripción activa, redirigir a activar
      if (!userWithSub.hasActiveSubscription) {
        console.log('🔒 [SubscriptionGuard] Sin suscripción activa, redirigiendo a pricing...')
        navigate('/activate-subscription', { replace: true })
        setChecking(false)
        return
      }

      // Todo OK → permitir acceso
      console.log('✅ [SubscriptionGuard] Suscripción activa verificada')
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
