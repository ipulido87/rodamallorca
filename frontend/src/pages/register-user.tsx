import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'

import { Build, Person } from '@mui/icons-material'
import axios, { AxiosError } from 'axios'
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLoginButton } from '../components/google-login-button'
import { EMAIL_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants/validation'
import {
  register as apiRegister,
  verifyCode as apiVerifyCode,
} from '../services/auth-service'

type UserRole = 'user' | 'owner'

type RegisterFormData = {
  name: string
  email: string
  password: string
  birthDate?: string
  phone?: string
  role: UserRole
  // Campos adicionales para talleres
  businessName?: string
  businessAddress?: string
  businessDescription?: string
}

export const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    birthDate: '',
    phone: '',
    role: 'user',
    businessName: '',
    businessAddress: '',
    businessDescription: '',
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

  // Obtener el tipo de cuenta desde la URL
  useEffect(() => {
    const type = searchParams.get('type') as UserRole
    if (type === 'user' || type === 'owner') {
      setFormData((prev) => ({ ...prev, role: type }))
    }
  }, [searchParams])

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

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const role = e.target.value as UserRole
    setFormData((prev) => ({ ...prev, role }))
  }

  const canSubmit = useMemo(() => {
    const basicValidation =
      formData.name.trim().length >= 2 &&
      formData.email.trim().length >= EMAIL_MIN_LENGTH &&
      formData.password.length >= PASSWORD_MIN_LENGTH

    // Validación adicional para talleres
    if (formData.role === 'owner') {
      return (
        basicValidation &&
        (formData.businessName?.trim().length ?? 0) >= 2 &&
        (formData.businessAddress?.trim().length ?? 0) >= 5
      )
    }

    return basicValidation
  }, [formData])

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      // Mapear los roles al formato que espera el backend
      const roleMapping = {
        user: 'USER',
        owner: 'WORKSHOP_OWNER',
      } as const

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        birthDate: formData.birthDate || undefined,
        phone: formData.phone?.trim() || undefined,
        role: roleMapping[formData.role] as 'USER' | 'WORKSHOP_OWNER',
        // Campos adicionales para talleres
        ...(formData.role === 'owner' && {
          businessName: formData.businessName?.trim(),
          businessAddress: formData.businessAddress?.trim(),
          businessDescription: formData.businessDescription?.trim(),
        }),
      }
      const data = await apiRegister(payload)
      setPendingEmail(data.user.email)
      setStep('code')
      showAlert(
        'Hemos enviado un código de verificación a tu email. Introdúcelo para verificar tu cuenta.',
        'success'
      )
    } catch (err) {
      let msg = 'Error en el registro. Inténtalo de nuevo.'
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
      showAlert('✅ Cuenta verificada. Ya puedes iniciar sesión.', 'success')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      let msg = 'Código inválido o expirado.'
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
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          {step === 'form' ? 'Crear Cuenta' : 'Verificar Cuenta'}
        </Typography>

        {step === 'form' && (
          <Box textAlign="center" sx={{ mb: 3 }}>
            <Chip
              icon={formData.role === 'user' ? <Person /> : <Build />}
              label={
                formData.role === 'user'
                  ? 'Registro como Cliente'
                  : 'Registro como Taller'
              }
              color={formData.role === 'user' ? 'primary' : 'secondary'}
              variant="outlined"
            />
          </Box>
        )}

        {step === 'form' ? (
          <Box component="form" onSubmit={handleRegister}>
            {/* Selector de tipo de cuenta */}
            <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
              <FormLabel component="legend">Tipo de cuenta</FormLabel>
              <RadioGroup
                row
                value={formData.role}
                onChange={handleRoleChange}
                sx={{ justifyContent: 'center', mt: 1 }}
              >
                <FormControlLabel
                  value="user"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" />
                      Cliente
                    </Box>
                  }
                />
                <FormControlLabel
                  value="owner"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Build fontSize="small" />
                      Taller
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {/* Campos básicos */}
            <TextField
              label="Nombre completo"
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
              label="Contraseña"
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
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
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

            {/* Campos adicionales para talleres */}
            {formData.role === 'owner' && (
              <>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Información del Taller
                  </Typography>
                </Divider>

                <TextField
                  label="Nombre del Taller/Negocio"
                  name="businessName"
                  value={formData.businessName ?? ''}
                  onChange={handleChange}
                  margin="normal"
                  required
                  fullWidth
                  inputProps={{ minLength: 2 }}
                />

                <TextField
                  label="Dirección del Taller"
                  name="businessAddress"
                  value={formData.businessAddress ?? ''}
                  onChange={handleChange}
                  margin="normal"
                  required
                  fullWidth
                  inputProps={{ minLength: 5 }}
                  placeholder="Calle, número, ciudad..."
                />

                <TextField
                  label="Descripción del Taller"
                  name="businessDescription"
                  value={formData.businessDescription ?? ''}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Cuéntanos sobre tu taller, servicios que ofreces..."
                />
              </>
            )}

            {/* Campos opcionales comunes */}
            <TextField
              label="Fecha de Nacimiento"
              name="birthDate"
              type="date"
              value={formData.birthDate ?? ''}
              onChange={handleChange}
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Teléfono"
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
                }}
              >
                {alertMessage}
              </Alert>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              disabled={!canSubmit || loading}
            >
              {loading
                ? 'Registrando…'
                : `Crear Cuenta ${
                    formData.role === 'user' ? 'de Cliente' : 'de Taller'
                  }`}
            </Button>

            <Divider sx={{ my: 3 }}>o</Divider>
            <GoogleLoginButton />

            <Box textAlign="center" sx={{ mt: 2 }}>
              <Button variant="text" onClick={() => navigate('/login')}>
                ¿Ya tienes cuenta? Iniciar sesión
              </Button>
            </Box>

            <Box textAlign="center" sx={{ mt: 1 }}>
              <Button variant="text" onClick={() => navigate('/')} size="small">
                Volver al inicio
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleVerify}>
            <TextField
              label="Código de Verificación"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              required
              fullWidth
              autoFocus
              helperText={`Hemos enviado el código a ${pendingEmail}`}
            />

            {alertOpen && (
              <Alert
                severity={alertSeverity}
                onClose={closeAlert}
                sx={{ mt: 1, mb: 2 }}
              >
                {alertMessage}
              </Alert>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
              disabled={loading || !code.trim()}
            >
              {loading ? 'Verificando…' : 'Verificar Cuenta'}
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
