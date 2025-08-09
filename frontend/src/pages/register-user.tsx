import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import axios, { AxiosError } from 'axios'
import { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EMAIL_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants/validation'
import {
  register as apiRegister,
  verifyCode as apiVerifyCode,
} from '../services/auth-service'

interface RegisterFormData {
  email: string
  password: string
}

export const Register = () => {
  const theme = useTheme()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
  })
  const [step, setStep] = useState<'form' | 'code'>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [code, setCode] = useState('')

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>(
    'success'
  )

  const showAlert = (msg: string, severity: 'success' | 'error') => {
    setAlertMessage(msg)
    setAlertSeverity(severity)
    setAlertOpen(true)
  }
  const handleCloseAlert = () => setAlertOpen(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const data = await apiRegister(formData.email, formData.password)
      setPendingEmail(data.user.email)
      setStep('code')
      showAlert(
        'Te enviamos un código al correo. Introdúcelo para verificar tu cuenta.',
        'success'
      )
    } catch (err) {
      let msg = 'No se pudo registrar. Inténtalo de nuevo.'
      if (axios.isAxiosError(err)) {
        const ax = err as AxiosError<{ message?: string }>
        msg = ax.response?.data?.message ?? msg // ← usa el mensaje del backend (ej: 409)
      }
      showAlert(msg, 'error')
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await apiVerifyCode(pendingEmail, code)
      showAlert('✅ Cuenta verificada. Ahora puedes iniciar sesión.', 'success')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      let msg = 'Código inválido o expirado.'
      if (axios.isAxiosError(err)) {
        const ax = err as AxiosError<{ message?: string }>
        msg = ax.response?.data?.message ?? msg
      }
      showAlert(msg, 'error')
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          {step === 'form' ? 'Registro' : 'Verificar cuenta'}
        </Typography>

        {step === 'form' ? (
          <Box component="form" onSubmit={handleRegister}>
            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ minLength: EMAIL_MIN_LENGTH }}
            />
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ minLength: PASSWORD_MIN_LENGTH }}
            />
            {alertOpen && (
              <Alert
                severity={alertSeverity}
                onClose={handleCloseAlert}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  backgroundColor:
                    alertSeverity === 'error'
                      ? theme.palette.error.light
                      : theme.palette.warning.light,
                  color:
                    alertSeverity === 'error'
                      ? theme.palette.error.contrastText
                      : theme.palette.warning.contrastText,
                }}
              >
                {alertMessage}
              </Alert>
            )}

            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
              Registrarse
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => navigate('/login')}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleVerify}>
            <TextField
              label="Código de verificación"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              required
              autoFocus
              helperText={`Hemos enviado el código a ${pendingEmail}`}
            />
            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
              Verificar cuenta
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => setStep('form')}
            >
              Volver
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
