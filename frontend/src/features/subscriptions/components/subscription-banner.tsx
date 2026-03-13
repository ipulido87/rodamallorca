import { Alert, Button, Box, Typography, Chip } from '@mui/material'
import { Warning, CreditCard, CheckCircle } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { redirectToCheckout, redirectToBillingPortal } from '../services/subscription-service'
import { SubscriptionStatus } from '../services/subscription-service'

interface SubscriptionBannerProps {
  workshopId: string
  subscriptionStatus: SubscriptionStatus
}

export const SubscriptionBanner = ({ workshopId, subscriptionStatus }: SubscriptionBannerProps) => {
  const { t } = useTranslation()
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
            {t('subscription.subscribeNow')}
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            🎁 {t('subscription.freeTrialActive')}
          </Typography>
          <Typography variant="body2">
            {t('subscription.daysRemaining', { count: daysLeft })}
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
            {t('subscription.subscribe')}
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            ⚠️ {t('subscription.freeTrialEnded')}
          </Typography>
          <Typography variant="body2">
            {t('subscription.freeTrialEndedDesc')}
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
            {t('subscription.updatePayment')}
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            ❌ {t('subscription.paymentPending')}
          </Typography>
          <Typography variant="body2">
            {t('subscription.paymentPendingDesc')}
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
            {t('subscription.reactivate')}
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            📅 {t('subscription.subscriptionCanceled')}
          </Typography>
          <Typography variant="body2">
            {t('subscription.subscriptionCanceledEndDate', { date: endDate })}
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
            {t('subscription.reactivate')}
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            🚫 {t('subscription.subscriptionCanceled')}
          </Typography>
          <Typography variant="body2">
            {t('subscription.subscriptionCanceledDesc')}
          </Typography>
        </Box>
      </Alert>
    )
  }

  return null
}
