import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { API } from '@/shared/api'
import { Seo } from '@/shared/components/Seo'

export const ForgotPassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await API.post('/auth/forgot-password', { email })
      setSuccess(true)
    } catch (err) {
      setError(t('auth.sendError'))
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
            ✉️ {t('auth.emailSent')}
          </Typography>
          <Alert severity="success" sx={{ mt: 2 }}>
            {t('auth.emailSentDesc')}
          </Alert>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => navigate('/login')}
          >
            {t('auth.backToLogin')}
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <>
      <Seo
        title="Restablecer Contraseña | RodaMallorca"
        description="Recupera el acceso a tu cuenta de RodaMallorca."
        robots="noindex,nofollow"
      />
      <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          {t('auth.forgotPasswordTitle')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          {t('auth.forgotPasswordDesc')}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoFocus
            disabled={loading}
          />

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
            {loading ? t('auth.sending') : t('auth.sendLink')}
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
