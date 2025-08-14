import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom' // 👈 IMPORTA ESTO
import { GoogleLoginButton } from '../components/google-login-button'
import { login } from '../services/auth-service'

interface LoginFormData {
  email: string
  password: string
}

export const LoginForm = () => {
  const navigate = useNavigate() // 👈 INICIALIZA AQUÍ

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const data = await login(formData.email, formData.password)
      localStorage.setItem('token', data.token) // si devuelves token
      navigate('/')
    } catch (err) {
      console.error('❌ Login failed:', err)
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Login
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
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
            Login
          </Button>
          <Divider sx={{ my: 3 }}>o</Divider>
          <GoogleLoginButton />
        </Box>
      </Paper>
    </Container>
  )
}
