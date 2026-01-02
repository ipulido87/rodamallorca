import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
  Button,
  Alert,
  alpha,
  useTheme,
} from '@mui/material'
import { Refresh, Warning } from '@mui/icons-material'
import { refreshOnboardingLink } from '../../../services/stripe-connect.service'

export const StripeConnectRefresh = () => {
  const { id: workshopId } = useParams<{ id: string }>()
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRefresh = async () => {
    if (!workshopId) return

    try {
      setLoading(true)
      setError(null)

      const response = await refreshOnboardingLink(workshopId)

      // Redirigir al nuevo link de onboarding
      window.location.href = response.onboardingUrl
    } catch (err: any) {
      console.error('Error regenerando link:', err)
      setError(err.message || 'Error al regenerar el link')
      setLoading(false)
    }
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
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
              }}
            >
              <Warning
                sx={{
                  fontSize: 60,
                  color: 'warning.main',
                }}
              />
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Link Expirado
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              El link de verificación de Stripe ha expirado. No te preocupes, puedes
              generar uno nuevo y continuar desde donde lo dejaste.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              color="warning"
              startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              fullWidth
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              {loading ? 'Generando nuevo link...' : 'Generar Nuevo Link'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
