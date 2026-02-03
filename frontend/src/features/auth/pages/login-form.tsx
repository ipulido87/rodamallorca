import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { GoogleLoginButton } from '../components/google-login-button'
import { useAuth } from '../hooks/useAuth'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Debe ser un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm = () => {
  const navigate = useNavigate()
  const auth = useAuth()

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (auth.authError) auth.clearError()
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    auth.clearError()
    setValidationErrors({})

    const result = loginSchema.safeParse(formData)

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message
        }
      })
      setValidationErrors(errors)
      return
    }

    try {
      const loggedUser = await auth.login(result.data.email, result.data.password)

      if (!loggedUser) {
        navigate('/catalog')
        return
      }

      // Redirect based on role and subscription status
      if (loggedUser.role === 'WORKSHOP_OWNER') {
        if (loggedUser.hasActiveSubscription) {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/activate-subscription', { replace: true })
        }
      } else if (loggedUser.role === 'USER') {
        navigate('/home', { replace: true })
      } else {
        navigate('/catalog', { replace: true })
      }
    } catch (error: unknown) {
      // Handle EMAIL_NOT_VERIFIED error
      if (
        error instanceof Error &&
        error.message.startsWith('EMAIL_NOT_VERIFIED:')
      ) {
        const email = error.message.split(':')[1]
        setPendingVerificationEmail(email)
        setShowVerificationDialog(true)
      }
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    try {
      await auth.resendVerification(pendingVerificationEmail)
      setShowVerificationDialog(false)
      auth.clearError()
    } catch {
      // Error is already handled in auth context
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Iniciar Sesión
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            disabled={auth.loading}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            disabled={auth.loading}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
          />

          {auth.authError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {auth.authError}
            </Alert>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={auth.loading}
          >
            {auth.loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
            onClick={() => navigate('/forgot-password')}
            disabled={auth.loading}
          >
            ¿Olvidaste tu contraseña?
          </Button>

          <Divider sx={{ my: 3 }}>o</Divider>

          <GoogleLoginButton mode="login" />

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
            disabled={auth.loading}
          >
            Volver al inicio
          </Button>
        </Box>
      </Paper>

      {/* ✅ DIÁLOGO MEJORADO DE VERIFICACIÓN */}
      <Dialog
        open={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          📧 Email No Verificado
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Tu email <strong>{pendingVerificationEmail}</strong> aún no ha sido
            verificado.
          </DialogContentText>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>¿Qué hacer?</strong>
            </Typography>
            <Typography variant="body2">
              1. Revisa tu bandeja de entrada
              <br />
              2. Busca el email de RodaMallorca
              <br />
              3. Haz clic en el botón de verificación
              <br />
              4. Vuelve aquí para iniciar sesión
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary">
            ¿No encuentras el email? Podemos reenviártelo.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowVerificationDialog(false)}
            disabled={resendLoading}
          >
            Cerrar
          </Button>
          <Button
            onClick={handleResendVerification}
            variant="contained"
            disabled={resendLoading}
          >
            {resendLoading ? 'Reenviando...' : '📨 Reenviar Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
