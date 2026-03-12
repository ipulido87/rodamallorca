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
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { PASSWORD_MIN_LENGTH } from '../../../shared/constants/validation'
import { register as apiRegister } from '../../auth/services/auth-service'
import { GoogleLoginButton } from '../../auth/components/google-login-button'
import { Seo } from '../../../shared/components/Seo'

type UserRole = 'user' | 'owner'

type RegisterFormData = {
  name: string
  email: string
  password: string
  birthDate?: string
  phone?: string
  role: 'user' | 'owner'
  businessName?: string
  businessAddress?: string
  businessDescription?: string
}

export const Register = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const registerSchema = z
    .object({
      name: z.string().min(2, t('auth.validation.nameMinLength', { count: 2 })),
      email: z
        .string()
        .min(1, t('auth.validation.emailRequired'))
        .email(t('auth.validation.emailInvalid')),
      password: z
        .string()
        .min(
          PASSWORD_MIN_LENGTH,
          t('auth.validation.passwordMinLength', { count: PASSWORD_MIN_LENGTH })
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
        message: t('auth.validation.workshopFieldsRequired'),
        path: ['businessName'],
      }
    )

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
      let msg = t('auth.registerError')
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
        title={`${t('auth.createAccount')} | RodaMallorca`}
        description="Regístrate en RodaMallorca para alquilar bicicletas, reservar talleres y comprar componentes de ciclismo en Mallorca."
        robots="noindex,nofollow"
      />
      <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        {step === 'form' ? (
          <>
            <Typography variant="h5" textAlign="center" gutterBottom>
              {t('auth.createAccount')}
            </Typography>

            <Box textAlign="center" sx={{ mb: 3 }}>
              <Chip
                icon={formData.role === 'user' ? <Person /> : <Build />}
                label={
                  formData.role === 'user'
                    ? t('auth.registerAsCustomer')
                    : t('auth.registerAsWorkshop')
                }
                color={formData.role === 'user' ? 'primary' : 'secondary'}
                variant="outlined"
              />
            </Box>

            <Box component="form" onSubmit={handleRegister}>
              <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                <FormLabel component="legend">{t('auth.accountType')}</FormLabel>
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
                        {t('auth.clientLabel')}
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
                        {t('auth.workshopLabel')}
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                label={t('auth.fullName')}
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
                label={t('auth.email')}
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
                label={t('auth.password')}
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
                            ? t('auth.hidePassword')
                            : t('auth.showPassword')
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
                      {t('auth.workshopInfo')}
                    </Typography>
                  </Divider>

                  <TextField
                    label={t('auth.workshopName')}
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
                    label={t('auth.workshopAddress')}
                    name="businessAddress"
                    value={formData.businessAddress ?? ''}
                    onChange={handleChange}
                    margin="normal"
                    required
                    fullWidth
                    placeholder={t('auth.workshopAddressPlaceholder')}
                    error={!!validationErrors.businessAddress}
                    helperText={validationErrors.businessAddress}
                  />

                  <TextField
                    label={t('auth.workshopDescription')}
                    name="businessDescription"
                    value={formData.businessDescription ?? ''}
                    onChange={handleChange}
                    margin="normal"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={t('auth.workshopDescriptionPlaceholder')}
                    error={!!validationErrors.businessDescription}
                    helperText={validationErrors.businessDescription}
                  />
                </>
              )}

              <TextField
                label={t('auth.birthDate')}
                name="birthDate"
                type="date"
                value={formData.birthDate ?? ''}
                onChange={handleChange}
                margin="normal"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label={t('auth.phone')}
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
                  ? t('auth.registering')
                  : formData.role === 'user'
                    ? t('auth.createCustomerAccount')
                    : t('auth.createWorkshopAccount')}
              </Button>

              <Divider sx={{ my: 3 }}>{t('common.or')}</Divider>
              <GoogleLoginButton
                mode="register"
                role={formData.role === 'owner' ? 'WORKSHOP_OWNER' : 'USER'}
              />

              <Box textAlign="center" sx={{ mt: 2 }}>
                <Button variant="text" onClick={() => navigate('/login')}>
                  {t('auth.alreadyHaveAccount')}
                </Button>
              </Box>

              <Box textAlign="center" sx={{ mt: 1 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/')}
                  size="small"
                >
                  {t('common.backToHome')}
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Box textAlign="center" py={4}>
            <Email sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />

            <Typography variant="h4" gutterBottom>
              {t('auth.checkEmail')}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('auth.verificationSent')}
            </Typography>

            <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 3 }}>
              <Typography variant="h6" color="primary">
                {registeredEmail}
              </Typography>
            </Paper>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" gutterBottom>
                <strong>{t('auth.instructions')}</strong>
              </Typography>
              <Typography variant="body2" component="div">
                1. {t('auth.instruction1')}
                <br />
                2. {t('auth.instruction2')}
                <br />
                3. {t('auth.instruction3')}
                <br />
                4. {t('auth.instruction4')}
              </Typography>
            </Alert>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('auth.didNotReceive')}
            </Typography>

            <Button
              variant="outlined"
              onClick={() => setStep('form')}
              sx={{ mr: 2 }}
            >
              {t('auth.backToRegister')}
            </Button>

            <Button variant="text" onClick={() => navigate('/login')}>
              {t('auth.goToLogin')}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
    </>
  )
}
