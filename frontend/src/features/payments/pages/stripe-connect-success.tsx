import { useEffect, useState } from 'react'
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
} from '@mui/material'
import { CheckCircle, Dashboard } from '@mui/icons-material'
import { getStripeAccountStatus } from '../../../services/stripe-connect.service'

export const StripeConnectSuccess = () => {
  const { id: workshopId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!workshopId) return

    // Verificar el estado de la cuenta
    const checkStatus = async () => {
      try {
        const status = await getStripeAccountStatus(workshopId)
        setVerified(status.onboardingComplete)
      } catch (error) {
        console.error('Error verificando estado:', error)
      } finally {
        setLoading(false)
      }
    }

    // Dar tiempo a Stripe para actualizar
    setTimeout(checkStatus, 2000)
  }, [workshopId])

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Verificando tu cuenta de Stripe...
          </Typography>
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
                bgcolor: alpha(theme.palette.success.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
              }}
            >
              <CheckCircle
                sx={{
                  fontSize: 60,
                  color: 'success.main',
                }}
              />
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {verified ? '¡Cuenta Verificada!' : '¡Proceso Completado!'}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {verified
                ? 'Tu cuenta de Stripe ha sido verificada exitosamente. Ya puedes vender productos y recibir pagos.'
                : 'Tu información ha sido recibida. Stripe está verificando tu cuenta, esto puede tomar unos minutos.'}
            </Typography>

            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Dashboard />}
                onClick={() => navigate('/dashboard')}
                fullWidth
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                Ir al Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
