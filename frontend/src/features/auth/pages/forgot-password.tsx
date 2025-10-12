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
import { useNavigate } from 'react-router-dom'
import { API } from '../services/auth-service'

export const ForgotPassword = () => {
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
      setError('Error al enviar el email. Inténtalo de nuevo.')
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
            ✉️ Email Enviado
          </Typography>
          <Alert severity="success" sx={{ mt: 2 }}>
            Si el email está registrado, recibirás un enlace para restablecer tu
            contraseña.
          </Alert>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => navigate('/login')}
          >
            Volver al login
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Restablecer Contraseña
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          Ingresa tu email y te enviaremos un enlace para restablecer tu
          contraseña
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
            {loading ? 'Enviando...' : 'Enviar Enlace'}
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
  )
}
