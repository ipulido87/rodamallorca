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

import { Build, Person, Email } from '@mui/icons-material'
import axios, { AxiosError } from 'axios'
import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { PASSWORD_MIN_LENGTH } from '../../../shared/constants/validation'
import { register as apiRegister } from '../../auth/services/auth-service'
import { GoogleLoginButton } from '../../auth/components/google-login-button'
import { Seo } from '../../../shared/components/Seo'

type UserRole = 'user' | 'owner'

const registerSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z
      .string()
      .min(1, 'El email es obligatorio')
      .email('Debe ser un email válido'),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
      ),
    birthDate: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(['user', 'owner']),
    businessName: z.string().optional(),
    businessAddress: z.string().optional(),
    businessDescription: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'owner') {
        return (
          data.businessName &&
          data.businessName.trim().length >= 2 &&
          data.businessAddress &&
          data.businessAddress.trim().length >= 5
        )
      }
      return true
    },
    {
      message: 'Los campos de taller son obligatorios para cuentas de taller',
      path: ['businessName'],
    }
  )

type RegisterFormData = z.infer<typeof registerSchema>

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

  // ✅ SOLO UN PASO: form o success
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [registeredEmail, setRegisteredEmail] = useState('')

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>(
    'success'
  )

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  useEffect(() => {
    const type = searchParams.get('type') as UserRole
    if (type === 'user' || type === 'owner') {
      setFormData((prev) => ({ ...prev, role: type }))
    }
  }, [searchParams])

  // Manejar errores de Google OAuth
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const newGoogleUser = searchParams.get('newGoogleUser')
    const googleEmail = searchParams.get('email')
    const googleRole = searchParams.get('role')

    if (errorParam) {
      showAlert(decodeURIComponent(errorParam), 'error')
      searchParams.delete('error')
      window.history.replaceState(
        {},
        '',
        `/register?${searchParams.toString()}`
      )
    }

    if (newGoogleUser) {
      if (googleEmail) {
        setFormData((prev) => ({
          ...prev,
          email: googleEmail,
          ...(googleRole && { role: googleRole as UserRole }),
        }))
      }

      showAlert(
        'Esta cuenta de Google es nueva. Completa los datos faltantes para terminar tu registro.',
        'success'
      )
      searchParams.delete('newGoogleUser')
      searchParams.delete('email')
      searchParams.delete('role')
      window.history.replaceState(
        {},
        '',
        `/register?${searchParams.toString()}`
      )
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

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const role = e.target.value as UserRole
    setFormData((prev) => ({ ...prev, role }))

    setValidationErrors((prev) => ({
      ...prev,
      businessName: '',
      businessAddress: '',
    }))
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    const result = registerSchema.safeParse(formData)

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
      const roleMapping = {
        user: 'USER',
        owner: 'WORKSHOP_OWNER',
      } as const

      const payload = {
        name: result.data.name.trim(),
        email: result.data.email.trim().toLowerCase(),
        password: result.data.password,
        birthDate: result.data.birthDate || undefined,
        phone: result.data.phone?.trim() || undefined,
        role: roleMapping[result.data.role] as 'USER' | 'WORKSHOP_OWNER',
        ...(result.data.role === 'owner' && {
          businessName: result.data.businessName?.trim(),
          businessAddress: result.data.businessAddress?.trim(),
          businessDescription: result.data.businessDescription?.trim(),
        }),
      }

      await apiRegister(payload)
      setRegisteredEmail(payload.email)
      setStep('success')
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

  return (
    <>
      <Seo
        title="Crear Cuenta | RodaMallorca"
        description="Regístrate en RodaMallorca para alquilar bicicletas, reservar talleres y comprar componentes de ciclismo en Mallorca."
        robots="noindex,nofollow"
      />
      <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        {step === 'form' ? (
          <>
            <Typography variant="h5" textAlign="center" gutterBottom>
              Crear Cuenta
            </Typography>

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

            <Box component="form" onSubmit={handleRegister}>
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
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Person fontSize="small" />
                        Cliente
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="owner"
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Build fontSize="small" />
                        Taller
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                label="Nombre completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                fullWidth
                error={!!validationErrors.name}
                helperText={validationErrors.name}
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
                error={!!validationErrors.email}
                helperText={validationErrors.email}
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
                error={!!validationErrors.password}
                helperText={validationErrors.password}
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
                    error={!!validationErrors.businessName}
                    helperText={validationErrors.businessName}
                  />

                  <TextField
                    label="Dirección del Taller"
                    name="businessAddress"
                    value={formData.businessAddress ?? ''}
                    onChange={handleChange}
                    margin="normal"
                    required
                    fullWidth
                    placeholder="Calle, número, ciudad..."
                    error={!!validationErrors.businessAddress}
                    helperText={validationErrors.businessAddress}
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
                    error={!!validationErrors.businessDescription}
                    helperText={validationErrors.businessDescription}
                  />
                </>
              )}

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
                disabled={loading}
              >
                {loading
                  ? 'Registrando…'
                  : `Crear Cuenta ${
                      formData.role === 'user' ? 'de Cliente' : 'de Taller'
                    }`}
              </Button>

              <Divider sx={{ my: 3 }}>o</Divider>
              <GoogleLoginButton
                mode="register"
                role={formData.role === 'owner' ? 'WORKSHOP_OWNER' : 'USER'}
              />

              <Box textAlign="center" sx={{ mt: 2 }}>
                <Button variant="text" onClick={() => navigate('/login')}>
                  ¿Ya tienes cuenta? Iniciar sesión
                </Button>
              </Box>

              <Box textAlign="center" sx={{ mt: 1 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/')}
                  size="small"
                >
                  Volver al inicio
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          // ✅ PANTALLA DE ÉXITO - SOLO INDICA REVISAR EMAIL
          <Box textAlign="center" py={4}>
            <Email sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />

            <Typography variant="h4" gutterBottom>
              ¡Revisa tu Email!
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Hemos enviado un link de verificación a:
            </Typography>

            <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 3 }}>
              <Typography variant="h6" color="primary">
                {registeredEmail}
              </Typography>
            </Paper>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" gutterBottom>
                <strong>Instrucciones:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                1. Abre tu bandeja de entrada
                <br />
                2. Busca el email de RodaMallorca
                <br />
                3. Haz clic en el botón "Activar Mi Cuenta"
                <br />
                4. ¡Listo! Serás redirigido automáticamente
              </Typography>
            </Alert>

            <Alert severity="warning" sx={{ mb: 3 }}>
              El link expirará en <strong>24 horas</strong>
            </Alert>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ¿No recibiste el email?
            </Typography>

            <Button
              variant="outlined"
              onClick={() => setStep('form')}
              sx={{ mr: 2 }}
            >
              Volver al Registro
            </Button>

            <Button variant="text" onClick={() => navigate('/login')}>
              Ir a Login
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
    </>
  )
}
