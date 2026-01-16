import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  Alert,
  LinearProgress,
} from '@mui/material'
import { CheckCircle, Dashboard, Refresh, Warning } from '@mui/icons-material'
import { getStripeAccountStatus } from '../../../services/stripe-connect.service'

const MAX_POLLING_ATTEMPTS = 10 // Máximo 10 intentos (30 segundos total)
const POLLING_INTERVAL = 3000 // 3 segundos entre intentos

export const StripeConnectSuccess = () => {
  const { id: workshopId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState('')
  const pollingInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!workshopId) return

    // Verificar el estado de la cuenta
    const checkStatus = async () => {
      try {
        console.log(
          `🔍 [StripeConnect] Verificando estado (intento ${attempts + 1}/${MAX_POLLING_ATTEMPTS})`
        )
        const status = await getStripeAccountStatus(workshopId)

        console.log('📊 [StripeConnect] Estado recibido:', status)

        if (status.onboardingComplete && status.chargesEnabled) {
          console.log('✅ [StripeConnect] Cuenta verificada y activa!')
          setVerified(true)
          setLoading(false)
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current)
          }
        } else if (attempts >= MAX_POLLING_ATTEMPTS - 1) {
          console.log('⚠️ [StripeConnect] Máximo de intentos alcanzado')
          setLoading(false)
          setError(
            'La verificación está tomando más tiempo del esperado. Puedes intentar verificar manualmente.'
          )
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current)
          }
        } else {
          console.log(
            `⏳ [StripeConnect] Cuenta aún no activa, esperando... (${attempts + 1}/${MAX_POLLING_ATTEMPTS})`
          )
          setAttempts((prev) => prev + 1)
        }
      } catch (error) {
        console.error('❌ [StripeConnect] Error verificando estado:', error)
        setError('Error al verificar el estado de la cuenta')
        setLoading(false)
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current)
        }
      }
    }

    // Primera verificación después de 2 segundos
    const initialTimeout = setTimeout(() => {
      checkStatus()

      // Luego, polling cada 3 segundos
      pollingInterval.current = setInterval(checkStatus, POLLING_INTERVAL)
    }, 2000)

    // Cleanup
    return () => {
      clearTimeout(initialTimeout)
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [workshopId, attempts])

  const handleManualVerification = async () => {
    if (!workshopId) return

    setLoading(true)
    setError('')
    setAttempts(0)

    try {
      const status = await getStripeAccountStatus(workshopId)
      if (status.onboardingComplete && status.chargesEnabled) {
        setVerified(true)
      } else {
        setError(
          'La cuenta aún no está completamente verificada. Por favor, espera unos minutos e intenta de nuevo.'
        )
      }
    } catch (error) {
      console.error('Error en verificación manual:', error)
      setError('Error al verificar el estado de la cuenta')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Verificando tu cuenta de Stripe...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Intento {attempts + 1} de {MAX_POLLING_ATTEMPTS}
          </Typography>
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={(attempts / MAX_POLLING_ATTEMPTS) * 100}
            />
          </Box>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Card
          sx={{
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: alpha(
                  verified
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                  0.1
                ),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
              }}
            >
              {verified ? (
                <CheckCircle
                  sx={{
                    fontSize: 60,
                    color: 'success.main',
                  }}
                />
              ) : (
                <Warning
                  sx={{
                    fontSize: 60,
                    color: 'warning.main',
                  }}
                />
              )}
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {verified
                ? '¡Cuenta Verificada!'
                : 'Verificación en Proceso'}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {verified
                ? 'Tu cuenta de Stripe ha sido verificada exitosamente. Ya puedes vender productos y recibir pagos.'
                : 'Tu información ha sido recibida. Stripe está verificando tu cuenta, esto puede tomar unos minutos.'}
            </Typography>

            {error && (
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2}>
              {!verified && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Refresh />}
                  onClick={handleManualVerification}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  Verificar Ahora
                </Button>
              )}

              <Button
                variant={verified ? 'contained' : 'outlined'}
                size="large"
                startIcon={<Dashboard />}
                onClick={() => navigate('/dashboard')}
                fullWidth
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                Ir al Dashboard
              </Button>
            </Stack>

            {!verified && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 3, display: 'block' }}
              >
                💡 Tip: Si la verificación tarda mucho, puedes volver más
                tarde. Tu cuenta se activará automáticamente.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
