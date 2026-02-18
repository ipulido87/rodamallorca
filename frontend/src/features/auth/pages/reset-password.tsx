import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { AxiosError } from 'axios'
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { API } from '@/shared/api'
import { Seo } from '@/shared/components/Seo'

// Schema de validación con Zod
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Debe contener mayúscula, minúscula y número'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  if (!token) {
    return (
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
          <Typography
            variant="h5"
            textAlign="center"
            gutterBottom
            color="error"
          >
            Token Inválido
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            El enlace es inválido o ha expirado.
          </Alert>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => navigate('/forgot-password')}
          >
            Solicitar nuevo enlace
          </Button>
        </Paper>
      </Container>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    // Validar con Zod
    const result = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    })

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

    setLoading(true)

    try {
      await API.post('/auth/reset-password', {
        token,
        newPassword: result.data.password,
      })
      setSuccess(true)
    } catch (err) {
      let message = 'Error al restablecer la contraseña'

      if (err instanceof AxiosError) {
        // Errores de Zod del backend
        if (
          err.response?.data?.errors &&
          Array.isArray(err.response.data.errors)
        ) {
          message = err.response.data.errors[0]?.message || message
        }
        // Mensaje directo del backend
        else if (err.response?.data?.message) {
          message = err.response.data.message
        }
      }

      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
          <Typography variant="h5" textAlign="center" gutterBottom>
            ✅ Contraseña Actualizada
          </Typography>
          <Alert severity="success" sx={{ mt: 2 }}>
            Tu contraseña ha sido actualizada correctamente.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/login')}
          >
            Ir al Login
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <>
      <Seo
        title="Nueva Contraseña | RodaMallorca"
        description="Establece una nueva contraseña para tu cuenta de RodaMallorca."
        robots="noindex,nofollow"
      />
      <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Nueva Contraseña
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          Ingresa tu nueva contraseña
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (validationErrors.password) {
                setValidationErrors((prev) => ({ ...prev, password: '' }))
              }
            }}
            margin="normal"
            required
            autoFocus
            disabled={loading}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirmar Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (validationErrors.confirmPassword) {
                setValidationErrors((prev) => ({
                  ...prev,
                  confirmPassword: '',
                }))
              }
            }}
            margin="normal"
            required
            disabled={loading}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2 }}
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Volver al login
          </Button>
        </Box>
      </Paper>
    </Container>
    </>
  )
}
