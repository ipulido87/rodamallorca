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
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { GoogleLoginButton } from '../components/google-login-button'
import {
  register as apiRegister,
  verifyCode as apiVerifyCode,
} from '../features/auth/services/auth-service'
import { PASSWORD_MIN_LENGTH } from '../shared/constants/validation'

type UserRole = 'user' | 'owner'

// Zod schema con validación condicional
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
      // Validación condicional: si es owner, los campos de negocio son requeridos
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
      path: ['businessName'], // El error se mostrará en businessName
    }
  )

// Schema separado para validación de código
const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'El código es obligatorio')
    .min(4, 'El código debe tener al menos 4 caracteres'),
})

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

  const [step, setStep] = useState<'form' | 'code'>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [code, setCode] = useState('')

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>(
    'success'
  )

  // Estados para errores de validación
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [codeError, setCodeError] = useState<string>('')

  // Obtener el tipo de cuenta desde la URL
  useEffect(() => {
    const type = searchParams.get('type') as UserRole
    if (type === 'user' || type === 'owner') {
      setFormData((prev) => ({ ...prev, role: type }))
    }
  }, [searchParams])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const newGoogleUser = searchParams.get('newGoogleUser')

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
      showAlert(
        'Esta cuenta de Google es nueva. Por favor elige el tipo de cuenta y continúa con Google.',
        'success' // ✅ Cambiar a 'success'
      )
      searchParams.delete('newGoogleUser')
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

    // Limpiar errores específicos al escribir
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const role = e.target.value as UserRole
    setFormData((prev) => ({ ...prev, role }))

    // Limpiar errores relacionados con el rol al cambiar
    setValidationErrors((prev) => ({
      ...prev,
      businessName: '',
      businessAddress: '',
    }))
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    // Validación con Zod
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
      // Mapear los roles al formato que espera el backend
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
        // Campos adicionales para talleres
        ...(result.data.role === 'owner' && {
          businessName: result.data.businessName?.trim(),
          businessAddress: result.data.businessAddress?.trim(),
          businessDescription: result.data.businessDescription?.trim(),
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
    setCodeError('')

    // Validación del código con Zod
    const result = verifyCodeSchema.safeParse({ code })

    if (!result.success) {
      setCodeError(result.error.issues[0]?.message || 'Código inválido')
      return
    }

    setLoading(true)
    try {
      await apiVerifyCode(pendingEmail, result.data.code.trim())
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
              role={formData.role === 'owner' ? 'WORKSHOP_OWNER' : 'USER'}
            />

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
              onChange={(e) => {
                setCode(e.target.value)
                if (codeError) setCodeError('')
              }}
              margin="normal"
              required
              fullWidth
              autoFocus
              error={!!codeError}
              helperText={
                codeError || `Hemos enviado el código a ${pendingEmail}`
              }
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
              disabled={loading}
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
