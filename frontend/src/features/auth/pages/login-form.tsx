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
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { GoogleLoginButton } from '../components/google-login-button'
import { useAuth } from '../hooks/useAuth'
import { Seo } from '../../../shared/components/Seo'

type LoginFormData = {
  email: string
  password: string
}

export const LoginForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const auth = useAuth()

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z
      .string()
      .min(1, t('auth.validation.passwordRequired'))
      .min(6, t('auth.validation.passwordMinLength', { count: 6 })),
  })

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
    <>
      <Seo
        title={`${t('auth.loginTitle')} | RodaMallorca`}
        description="Accede a tu cuenta de RodaMallorca para gestionar tus alquileres, reservas y compras de ciclismo en Mallorca."
        robots="noindex,nofollow"
      />
      <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          {t('auth.loginTitle')}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('auth.email')}
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
            label={t('auth.password')}
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
            {auth.loading ? t('auth.loggingIn') : t('auth.loginTitle')}
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
            onClick={() => navigate('/forgot-password')}
            disabled={auth.loading}
          >
            {t('auth.forgotPassword')}
          </Button>

          <Divider sx={{ my: 3 }}>{t('common.or')}</Divider>

          <GoogleLoginButton mode="login" />

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
            disabled={auth.loading}
          >
            {t('common.backToHome')}
          </Button>
        </Box>
      </Paper>

      <Dialog
        open={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          {t('auth.emailNotVerified')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('auth.emailNotVerifiedDesc', { email: pendingVerificationEmail })}
          </DialogContentText>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>{t('auth.whatToDo')}</strong>
            </Typography>
            <Typography variant="body2">
              1. {t('auth.checkInbox')}
              <br />
              2. {t('auth.findEmail')}
              <br />
              3. {t('auth.clickVerify')}
              <br />
              4. {t('auth.comeBackLogin')}
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary">
            {t('auth.cantFindEmail')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowVerificationDialog(false)}
            disabled={resendLoading}
          >
            {t('common.close')}
          </Button>
          <Button
            onClick={handleResendVerification}
            variant="contained"
            disabled={resendLoading}
          >
            {resendLoading ? t('auth.resending') : t('auth.resendEmail')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </>
  )
}
