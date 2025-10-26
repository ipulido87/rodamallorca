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
import { useAuth } from '../hooks/useAuth' // ✅ USAR HOOK

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
  const auth = useAuth() // ✅ USAR HOOK

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar errores al escribir
    if (auth.authError) auth.clearError()
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    auth.clearError()
    setValidationErrors({})

    // Validación con Zod
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
      await auth.login(result.data.email, result.data.password)

      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}')

        if (user.role === 'WORKSHOP_OWNER') {
          navigate('/dashboard')
        } else if (user.role === 'USER') {
          navigate('/home')
        } else {
          navigate('/catalog')
        }
      }, 100)
    } catch (error: unknown) {
      console.error('Login failed:', error)

      // ✅ MANEJAR ERROR DE EMAIL NO VERIFICADO
      if (
        error instanceof Error &&
        error.message.startsWith('EMAIL_NOT_VERIFIED:')
      ) {
        const email = error.message.split(':')[1]
        setPendingVerificationEmail(email)
        setShowVerificationDialog(true)
        return
      }
    }
  }

  const handleResendVerification = async () => {
    try {
      await auth.resendVerification(pendingVerificationEmail)
      setShowVerificationDialog(false)
    } catch (error: unknown) {
      // El error ya fue seteado por el AuthProvider
      console.error('Error reenviando verificación:', error)
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

      <Dialog
        open={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
      >
        <DialogTitle>Email No Verificado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tu email <strong>{pendingVerificationEmail}</strong> no ha sido
            verificado. ¿Quieres que te reenviemos el email de verificación?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVerificationDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleResendVerification}
            variant="contained"
            disabled={auth.loading}
          >
            Reenviar Verificación
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
