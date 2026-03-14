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
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
            {t('auth.invalidToken')}
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            {t('auth.invalidTokenDesc')}
          </Alert>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => navigate('/forgot-password')}
          >
            {t('auth.requestNewLink')}
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
      let message = t('auth.resetError')

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
            ✅ {t('auth.passwordUpdated')}
          </Typography>
          <Alert severity="success" sx={{ mt: 2 }}>
            {t('auth.passwordUpdatedDesc')}
          </Alert>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/login')}
          >
            {t('auth.goToLogin')}
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
          {t('auth.resetPasswordTitle')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          {t('auth.resetPasswordDesc')}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('auth.newPasswordLabel')}
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
            label={t('auth.confirmPasswordLabel')}
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
            {t('auth.passwordRequirements')}
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
            {loading ? t('auth.updating') : t('auth.updatePassword')}
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2 }}
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            {t('auth.backToLogin')}
          </Button>
        </Box>
      </Paper>
    </Container>
    </>
  )
}
