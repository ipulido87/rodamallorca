import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLoginButton } from '../components/google-login-button'
import { useAuth } from '../hooks/use-auth' // Usar tu hook de auth

interface LoginFormData {
  email: string
  password: string
}

export const LoginForm = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuth() // Usar el contexto de auth

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Usar el método login del contexto
      await login(formData.email, formData.password)

      // El AuthProvider ya maneja el token y el usuario
      // Ahora redirigir según el rol del usuario

      // Pequeña espera para que se actualice el estado del usuario
      setTimeout(() => {
        // El usuario ya está disponible en el contexto después del login
        const user = JSON.parse(localStorage.getItem('user') || '{}')

        if (user.role === 'WORKSHOP_OWNER') {
          navigate('/dashboard')
        } else if (user.role === 'USER') {
          navigate('/home')
        } else {
          navigate('/catalog') // Fallback
        }
      }, 100)
    } catch (err: unknown) {
      console.error('Login failed:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al iniciar sesión. Verifica tus credenciales.'
      setError(errorMessage)
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
            disabled={loading}
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
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <Divider sx={{ my: 3 }}>o</Divider>
          <GoogleLoginButton />

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
