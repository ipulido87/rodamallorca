import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../auth/hooks/useAuth'
import { API } from '../../auth/services/auth-service'

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
    const checkSubscription = async () => {
      // Si no es WORKSHOP_OWNER, permitir acceso inmediatamente
      if (!user || user.role !== 'WORKSHOP_OWNER') {
        setHasAccess(true)
        setChecking(false)
        return
      }

      try {
        // Verificar si tiene talleres y suscripción
        const { data: workshops } = await API.get('/owner/workshops/mine')

        if (!workshops || workshops.length === 0) {
          // Sin talleres → crear uno primero
          console.log('🔒 [SubscriptionGuard] Sin talleres, redirigiendo a crear...')
          navigate('/create-workshop', { replace: true })
          return
        }

        // Verificar si algún taller tiene suscripción activa
        const hasActiveSub = workshops.some((w: any) => {
          const status = w.subscription?.status
          return status === 'ACTIVE' || status === 'TRIALING'
        })

        if (!hasActiveSub) {
          // Sin suscripción activa → activar
          console.log('🔒 [SubscriptionGuard] Sin suscripción activa, redirigiendo a pricing...')
          navigate('/activate-subscription', { replace: true })
          return
        }

        // Todo OK → permitir acceso
        console.log('✅ [SubscriptionGuard] Suscripción activa verificada')
        setHasAccess(true)
      } catch (error: any) {
        console.error('❌ [SubscriptionGuard] Error verificando suscripción:', error)

        // Si es 403 de suscripción, redirigir
        if (error.response?.status === 403 && error.response?.data?.error === 'NO_ACTIVE_SUBSCRIPTION') {
          navigate('/activate-subscription', { replace: true })
          return
        }

        // Otro error → permitir acceso (para no bloquear por errores de red)
        setHasAccess(true)
      } finally {
        setChecking(false)
      }
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
