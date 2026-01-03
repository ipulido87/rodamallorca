import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  Alert,
  alpha,
  useTheme,
} from '@mui/material'
import {
  CheckCircle,
  Payment,
  OpenInNew,
  Warning,
  Refresh,
  Build,
} from '@mui/icons-material'
import {
  initiateStripeConnect,
  getStripeAccountStatus,
  getStripeDashboardLink,
  type StripeConnectStatus,
} from '../../../services/stripe-connect.service'

interface StripeConnectCardProps {
  workshopId: string
}

export const StripeConnectCard = ({ workshopId }: StripeConnectCardProps) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StripeConnectStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  // Cargar estado al montar el componente
  useEffect(() => {
    loadStatus()
  }, [workshopId])

  const loadStatus = async () => {
    try {
      setLoadingStatus(true)
      const accountStatus = await getStripeAccountStatus(workshopId)
      setStatus(accountStatus)
    } catch (err: any) {
      console.error('Error cargando estado de Stripe:', err)
      setError(err.message || 'Error cargando estado')
    } finally {
      setLoadingStatus(false)
    }
  }

  const handleConnect = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await initiateStripeConnect(workshopId)

      // Redirigir al onboarding de Stripe
      window.location.href = response.onboardingUrl
    } catch (err: any) {
      console.error('Error iniciando Stripe Connect:', err)
      setError(err.message || 'Error al conectar con Stripe')
      setLoading(false)
    }
  }

  const handleOpenDashboard = async () => {
    try {
      setLoading(true)
      const response = await getStripeDashboardLink(workshopId)
      window.open(response.url, '_blank')
    } catch (err: any) {
      console.error('Error abriendo dashboard:', err)
      setError(err.message || 'Error al abrir dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loadingStatus) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${theme.palette.background.paper} 100%)`,
        borderRadius: 3,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Payment sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Pagos con Stripe
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vende productos y recibe pagos directamente
                </Typography>
              </Box>
            </Stack>

            {/* Badge de estado */}
            {status?.hasAccount && status.onboardingComplete && (
              <Chip
                icon={<CheckCircle />}
                label="Verificado"
                color="success"
                sx={{ fontWeight: 600 }}
              />
            )}
            {status?.hasAccount && !status.onboardingComplete && (
              <Chip
                icon={<Warning />}
                label="Pendiente"
                color="warning"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Descripción */}
          {!status?.hasAccount && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>¿Por qué conectar Stripe?</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • Recibe pagos de forma segura cuando vendas productos
                <br />
                • RodaMallorca retiene solo un 10% de comisión
                <br />
                • El dinero llega directo a tu cuenta bancaria
                <br />• Gestiona tus pagos desde el dashboard de Stripe
              </Typography>
            </Alert>
          )}

          {/* Estado de cuenta pendiente */}
          {status?.hasAccount && !status.onboardingComplete && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Verificación pendiente</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Necesitas completar la verificación de Stripe para poder vender productos.
                Haz clic en "Completar Verificación" para continuar.
              </Typography>
            </Alert>
          )}

          {/* Estado de cuenta verificada */}
          {status?.onboardingComplete && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>¡Cuenta verificada!</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Ya puedes vender productos y recibir pagos. Gestiona tus ingresos desde
                tu dashboard de Stripe.
              </Typography>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Botones de acción */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {!status?.hasAccount && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                  onClick={handleConnect}
                  disabled={loading}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  Conectar con Stripe
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Build />}
                  onClick={() => navigate(`/workshops/${workshopId}/stripe/diagnostic`)}
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  Diagnosticar
                </Button>
              </>
            )}

            {status?.hasAccount && !status.onboardingComplete && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  color="warning"
                  startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                  onClick={handleConnect}
                  disabled={loading}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  Completar Verificación
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Build />}
                  onClick={() => navigate(`/workshops/${workshopId}/stripe/diagnostic`)}
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  Diagnosticar
                </Button>
              </>
            )}

            {status?.onboardingComplete && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <OpenInNew />}
                  onClick={handleOpenDashboard}
                  disabled={loading}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  Abrir Dashboard Stripe
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Refresh />}
                  onClick={loadStatus}
                  disabled={loadingStatus}
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  Actualizar
                </Button>
              </>
            )}
          </Stack>

          {/* Info adicional */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              borderLeft: `4px solid ${theme.palette.info.main}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Nota:</strong> RodaMallorca retiene automáticamente el 10% de
              cada venta como comisión. El resto llega directo a tu cuenta bancaria.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
