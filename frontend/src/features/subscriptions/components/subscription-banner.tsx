import { Alert, Button, Box, Typography, Chip } from '@mui/material'
import { Warning, CreditCard, CheckCircle } from '@mui/icons-material'
import { redirectToCheckout, redirectToBillingPortal } from '../services/subscription-service'
import { SubscriptionStatus } from '../services/subscription-service'

interface SubscriptionBannerProps {
  workshopId: string
  subscriptionStatus: SubscriptionStatus
}

export const SubscriptionBanner = ({ workshopId, subscriptionStatus }: SubscriptionBannerProps) => {
  const { hasSubscription, status, isActive, subscription } = subscriptionStatus

  // No mostrar nada si tiene suscripción activa y no está por cancelarse
  if (isActive && !subscription?.cancelAtPeriodEnd) {
    return null
  }

  const handleSubscribe = async () => {
    await redirectToCheckout(workshopId)
  }

  const handleManage = async () => {
    await redirectToBillingPortal(workshopId)
  }

  // Trial activo
  if (status === 'TRIALING' && subscription?.trialEnd) {
    const daysLeft = Math.ceil(
      (new Date(subscription.trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    return (
      <Alert
        severity="info"
        icon={<CheckCircle />}
        action={
          <Button color="inherit" size="small" onClick={handleSubscribe}>
            Suscribirme Ahora
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            🎁 Prueba Gratis Activa
          </Typography>
          <Typography variant="body2">
            Te quedan {daysLeft} {daysLeft === 1 ? 'día' : 'días'} de prueba gratuita. Suscríbete
            antes de que termine para seguir disfrutando de todas las funcionalidades.
          </Typography>
        </Box>
      </Alert>
    )
  }

  // Trial expirado / Sin suscripción
  if (!hasSubscription || status === 'TRIALING') {
    return (
      <Alert
        severity="warning"
        icon={<Warning />}
        action={
          <Button color="inherit" size="small" variant="outlined" onClick={handleSubscribe}>
            Suscribirme
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            ⚠️ Prueba Gratuita Finalizada
          </Typography>
          <Typography variant="body2">
            Tu período de prueba ha terminado. Suscríbete por solo 14.50€/mes para continuar
            usando RodaMallorca.
          </Typography>
        </Box>
      </Alert>
    )
  }

  // Pago vencido
  if (status === 'PAST_DUE') {
    return (
      <Alert
        severity="error"
        icon={<CreditCard />}
        action={
          <Button color="inherit" size="small" variant="outlined" onClick={handleManage}>
            Actualizar Pago
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            ❌ Pago Pendiente
          </Typography>
          <Typography variant="body2">
            Hubo un problema con tu último pago. Actualiza tu método de pago para evitar la
            suspensión de tu cuenta.
          </Typography>
        </Box>
      </Alert>
    )
  }

  // Cancelada al final del período
  if (subscription?.cancelAtPeriodEnd && subscription?.currentPeriodEnd) {
    const endDate = new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES')

    return (
      <Alert
        severity="warning"
        icon={<Warning />}
        action={
          <Button color="inherit" size="small" onClick={handleManage}>
            Reactivar
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            📅 Suscripción Cancelada
          </Typography>
          <Typography variant="body2">
            Tu suscripción finalizará el {endDate}. Después de esa fecha, perderás acceso a las
            funcionalidades premium.
          </Typography>
        </Box>
      </Alert>
    )
  }

  // Cancelada
  if (status === 'CANCELED') {
    return (
      <Alert
        severity="error"
        icon={<Warning />}
        action={
          <Button color="inherit" size="small" variant="outlined" onClick={handleSubscribe}>
            Reactivar
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            🚫 Suscripción Cancelada
          </Typography>
          <Typography variant="body2">
            Tu suscripción ha sido cancelada. Reactiva tu cuenta para volver a disfrutar de todas
            las funcionalidades.
          </Typography>
        </Box>
      </Alert>
    )
  }

  return null
}
