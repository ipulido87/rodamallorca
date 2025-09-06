import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import axios, { AxiosError } from 'axios'
import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLoginButton } from '../components/google-login-button'
import { EMAIL_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants/validation'
import {
  register as apiRegister,
  verifyCode as apiVerifyCode,
} from '../services/auth-service'

type RegisterFormData = {
  name: string
  email: string
  password: string
  birthDate?: string
  phone?: string
}

export const Register = () => {
  const theme = useTheme()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    birthDate: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

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
  const closeAlert = () => setAlertOpen(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length >= 2 &&
      formData.email.trim().length >= EMAIL_MIN_LENGTH &&
      formData.password.length >= PASSWORD_MIN_LENGTH
    )
  }, [formData])

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        birthDate: formData.birthDate || undefined,
        phone: formData.phone?.trim() || undefined,
      }
      const data = await apiRegister(payload)
      setPendingEmail(data.user.email)
      setStep('code')
      showAlert(
        'We have sent a verification code to your email. Enter it to verify your account.',
        'success'
      )
    } catch (err) {
      let msg = 'Registration failed. Please try again.'
      if (axios.isAxiosError(err)) {
        const ax = err as AxiosError<{ message?: string }>
        msg = ax.response?.data?.message ?? msg
      }
      showAlert(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    try {
      await apiVerifyCode(pendingEmail, code.trim())
      showAlert('✅ Account verified. You can now log in.', 'success')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      let msg = 'Invalid or expired code.'
      if (axios.isAxiosError(err)) {
        const ax = err as AxiosError<{ message?: string }>
        msg = ax.response?.data?.message ?? msg
      }
      showAlert(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          {step === 'form' ? 'Register' : 'Verify Account'}
        </Typography>

        {step === 'form' ? (
          <Box component="form" onSubmit={handleRegister}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              inputProps={{ minLength: 2 }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              inputProps={{ minLength: EMAIL_MIN_LENGTH }}
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              inputProps={{ minLength: PASSWORD_MIN_LENGTH }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Birth Date"
              name="birthDate"
              type="date"
              value={formData.birthDate ?? ''}
              onChange={handleChange}
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone ?? ''}
              onChange={handleChange}
              margin="normal"
              fullWidth
              placeholder="+34 600 000 000"
            />

            {alertOpen && (
              <Alert
                severity={alertSeverity}
                onClose={closeAlert}
                sx={{
                  mt: 1,
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

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={!canSubmit || loading}
            >
              {loading ? 'Registering…' : 'Register'}
            </Button>

            <Divider sx={{ my: 3 }}>or</Divider>
            <GoogleLoginButton />

            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => navigate('/login')}
            >
              Already have an account? Log in
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleVerify}>
            <TextField
              label="Verification Code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              required
              fullWidth
              autoFocus
              helperText={`We sent the code to ${pendingEmail}`}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading || !code.trim()}
            >
              {loading ? 'Verifying…' : 'Verify Account'}
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => setStep('form')}
            >
              Back
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
