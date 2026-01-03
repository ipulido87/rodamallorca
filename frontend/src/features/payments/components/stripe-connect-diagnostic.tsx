import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material'
import {
  Warning,
  CheckCircle,
  Build,
  Refresh,
  LinkOff,
  Link,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { API } from '../../auth/services/auth-service'
import {
  getStripeAccountStatus,
  initiateStripeConnect,
} from '../../../services/stripe-connect.service'

interface RecoveryResponse {
  success: boolean
  recovered?: boolean
  method?: string
  accountId?: string
  email?: string
  onboardingComplete?: boolean
  message?: string
  error?: string
  suggestion?: string
  searchedEmail?: string
}

interface WorkshopDiagnostic {
  id: string
  name: string
  hasStripeAccount: boolean
  stripeAccountId: string | null
  onboardingComplete: boolean
}

export const StripeConnectDiagnostic = ({ workshopId }: { workshopId: string }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [diagnostic, setDiagnostic] = useState<WorkshopDiagnostic | null>(null)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')

  const runDiagnostic = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      // Obtener estado actual
      const status = await getStripeAccountStatus(workshopId)

      setDiagnostic({
        id: workshopId,
        name: 'Taller',
        hasStripeAccount: status.hasAccount,
        stripeAccountId: status.accountId || null,
        onboardingComplete: status.onboardingComplete,
      })

      if (status.hasAccount && status.onboardingComplete) {
        setResult('✅ Stripe Connect está configurado correctamente')
      } else if (status.hasAccount && !status.onboardingComplete) {
        setResult('⚠️ Cuenta de Stripe existe pero el onboarding no está completo')
      } else {
        setResult('❌ No hay cuenta de Stripe conectada')
      }
    } catch (err: any) {
      setError('Error al diagnosticar: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const recoverByEmail = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await API.post<RecoveryResponse>(
        `/workshops/${workshopId}/stripe/recover-by-email`
      )

      if (response.data.success && response.data.recovered) {
        setResult(
          `✅ ${response.data.message}\n` +
            `Cuenta: ${response.data.accountId}\n` +
            `Email: ${response.data.email}\n` +
            `Onboarding completo: ${response.data.onboardingComplete ? 'Sí' : 'No'}`
        )

        // Actualizar diagnóstico
        await runDiagnostic()
      } else {
        setError(response.data.error || 'No se pudo recuperar la cuenta')
        if (response.data.suggestion) {
          setError((prev) => `${prev}\n\n💡 ${response.data.suggestion}`)
        }
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Error desconocido'
      const suggestion = err.response?.data?.suggestion

      setError(errorMsg)
      if (suggestion) {
        setError((prev) => `${prev}\n\n💡 ${suggestion}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const connectStripeNew = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await initiateStripeConnect(workshopId)
      // Redirigir al onboarding de Stripe
      window.location.href = response.onboardingUrl
    } catch (err: any) {
      setError('Error al iniciar conexión: ' + (err.message || 'Error desconocido'))
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Build sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Diagnóstico de Stripe Connect
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Herramienta para diagnosticar y resolver problemas de conexión
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Botón de diagnóstico */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Refresh />}
                onClick={runDiagnostic}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Diagnosticando...' : 'Ejecutar Diagnóstico'}
              </Button>
            </Box>

            {/* Resultados del diagnóstico */}
            {diagnostic && (
              <Alert
                severity={
                  diagnostic.hasStripeAccount && diagnostic.onboardingComplete
                    ? 'success'
                    : diagnostic.hasStripeAccount
                      ? 'warning'
                      : 'error'
                }
                sx={{ mb: 3 }}
                icon={
                  diagnostic.hasStripeAccount && diagnostic.onboardingComplete ? (
                    <CheckCircle />
                  ) : (
                    <Warning />
                  )
                }
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Estado Actual:
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Chip
                      label={
                        diagnostic.hasStripeAccount
                          ? 'Cuenta Existe'
                          : 'Sin Cuenta'
                      }
                      color={diagnostic.hasStripeAccount ? 'success' : 'error'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={
                        diagnostic.onboardingComplete
                          ? 'Onboarding Completo'
                          : 'Onboarding Pendiente'
                      }
                      color={diagnostic.onboardingComplete ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                  {diagnostic.stripeAccountId && (
                    <Typography variant="caption">
                      ID: {diagnostic.stripeAccountId}
                    </Typography>
                  )}
                </Stack>
              </Alert>
            )}

            {/* Resultado */}
            {result && (
              <Alert severity="success" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {result}
              </Alert>
            )}

            {/* Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {error}
              </Alert>
            )}

            {/* Acciones de recuperación */}
            {diagnostic && !diagnostic.onboardingComplete && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Acciones de Recuperación:
                </Typography>

                <Stack spacing={2}>
                  {/* Opción 1: Recuperar por email */}
                  <Card variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Link sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Recuperar cuenta existente
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Si completaste el onboarding de Stripe pero no se guardó la
                        conexión, usa esta opción para recuperar tu cuenta.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={recoverByEmail}
                        disabled={loading}
                        fullWidth
                      >
                        {loading ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Recuperar por Email'
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Opción 2: Conectar nueva */}
                  <Card variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <LinkOff sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Conectar Stripe desde cero
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Si nunca conectaste Stripe o la recuperación falló, inicia el
                        proceso de conexión desde cero.
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={connectStripeNew}
                        disabled={loading}
                        fullWidth
                      >
                        Conectar Stripe Connect
                      </Button>
                    </CardContent>
                  </Card>
                </Stack>
              </Box>
            )}

            {/* Instrucciones */}
            <Alert severity="info">
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                ℹ️ ¿Qué hacer?
              </Typography>
              <Typography variant="body2">
                1. Ejecuta el <strong>Diagnóstico</strong> para ver el estado actual
                <br />
                2. Si no hay cuenta, usa <strong>Recuperar por Email</strong> primero
                <br />
                3. Si la recuperación falla, usa{' '}
                <strong>Conectar Stripe desde cero</strong>
                <br />
                4. Una vez conectado, vuelve a ejecutar el diagnóstico para confirmar
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
