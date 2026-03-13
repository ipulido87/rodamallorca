// frontend/src/pages/Profile.tsx
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  alpha,
  CircularProgress,
  Alert,
} from '@mui/material'

import {
  Edit,
  Email,
  Person,
  Phone,
  Cake,
  Lock,
  Verified,
  Save,
  Cancel,
} from '@mui/icons-material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import { useAuth } from '../features/auth/hooks/useAuth'
import { API, getErrorMessage } from '@/shared/api'
import { useSnackbar } from '../shared/hooks/use-snackbar'
import type { User } from '../features/auth/providers/auth-providers'

// Servicios API
const getUserProfile = async (): Promise<User> => {
  const { data } = await API.get<User>('/auth/me')
  return data
}

const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
  const { data } = await API.put<User>('/auth/profile', updates)
  return data
}

const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await API.post('/auth/change-password', { currentPassword, newPassword })
}

export const Profile = () => {
  const { user: authUser, refreshMe } = useAuth()
  const { showSuccess, showError } = useSnackbar()
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState(false)
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: authUser?.name || '',
    phone: authUser?.phone || '',
    birthDate: authUser?.birthDate || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // SWR: Cargar perfil del usuario
  const { data: user, isLoading, mutate } = useSWR<User>(
    '/auth/me',
    getUserProfile,
    {
      fallbackData: authUser || undefined,
      revalidateOnFocus: true,
    }
  )

  const handleEditToggle = () => {
    if (editMode) {
      // Cancelar edición, restaurar valores
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        birthDate: user?.birthDate || '',
      })
    } else {
      // Entrar en modo edición
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        birthDate: user?.birthDate || '',
      })
    }
    setEditMode(!editMode)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await updateUserProfile(formData)

      // Actualizar cache de SWR
      mutate(updated, false)

      // Actualizar contexto de auth
      await refreshMe()

      setEditMode(false)
      showSuccess(t('profile.profileUpdated'))
    } catch (error: unknown) {
      showError(getErrorMessage(error, t('profile.profileUpdateError')))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError(t('profile.passwordsMismatch'))
      return
    }

    if (passwordData.newPassword.length < 6) {
      showError(t('profile.passwordTooShort'))
      return
    }

    try {
      setSaving(true)
      await changePassword(passwordData.currentPassword, passwordData.newPassword)

      setPasswordDialog(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      showSuccess(t('profile.passwordChanged'))
    } catch (error: unknown) {
      showError(getErrorMessage(error, t('profile.passwordChangeError')))
    } finally {
      setSaving(false)
    }
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'WORKSHOP_OWNER':
        return t('profile.workshopOwner')
      case 'ADMIN':
        return t('profile.admin')
      default:
        return t('nav.user')
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'WORKSHOP_OWNER':
        return 'primary'
      case 'ADMIN':
        return 'error'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('profile.loadingProfile')}
          </Typography>
        </Box>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            {t('profile.loadError')}
          </Alert>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('profile.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('profile.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {/* Columna Principal */}
        <Box sx={{ width: { xs: "100%", md: "66.66666666666666%" }, flexGrow: 1 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                {/* Avatar y nombre */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    src={user.picture || undefined}
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: '2.5rem',
                      bgcolor: 'primary.main',
                    }}
                  >
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    {editMode ? (
                      <TextField
                        fullWidth
                        label={t('profile.name')}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    ) : (
                      <>
                        <Typography variant="h5" fontWeight="bold">
                          {user.name || t('profile.noName')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </>
                    )}
                  </Box>
                  {!editMode && (
                    <IconButton
                      onClick={handleEditToggle}
                      sx={{
                        bgcolor: alpha('#000', 0.05),
                        '&:hover': { bgcolor: alpha('#000', 0.1) },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  )}
                </Box>

                <Divider />

                {/* Email */}
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t('auth.email')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email color="action" />
                    <Typography variant="body1">{user.email}</Typography>
                    {user.verified && (
                      <Chip
                        icon={<Verified />}
                        label={t('common.verified')}
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                </Box>

                <Divider />

                {/* Teléfono */}
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t('profile.phoneLabel')}
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      placeholder={t('profile.phonePlaceholder')}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone color="action" />
                      <Typography variant="body1">
                        {user.phone || t('profile.notSpecified')}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider />

                {/* Fecha de nacimiento */}
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t('profile.birthDateLabel')}
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      type="date"
                      value={formData.birthDate?.split('T')[0] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, birthDate: e.target.value })
                      }
                      InputProps={{
                        startAdornment: <Cake sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cake color="action" />
                      <Typography variant="body1">
                        {user.birthDate
                          ? new Date(user.birthDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : t('profile.notSpecifiedFem')}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Botones de acción */}
                {editMode && (
                  <>
                    <Divider />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving}
                        fullWidth
                      >
                        {saving ? t('profile.savingChanges') : t('profile.saveChanges')}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleEditToggle}
                        disabled={saving}
                        fullWidth
                      >
                        {t('common.cancel')}
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: { xs: "100%", md: "33.33333333333333%" }, flexGrow: 1 }}>
          <Stack spacing={3}>
            {/* Información de cuenta */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('profile.accountInfo')}
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('profile.role')}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        icon={<Person />}
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('profile.memberSince')}
                    </Typography>
                    <Typography variant="body2">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : t('profile.unknown')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('profile.lastUpdate')}
                    </Typography>
                    <Typography variant="body2">
                      {user.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : t('profile.unknown')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Seguridad */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('profile.security')}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialog(true)}
                  fullWidth
                >
                  {t('profile.changePassword')}
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>

      {/* Dialog: Cambiar Contraseña */}
      <Dialog
        open={passwordDialog}
        onClose={() => !saving && setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('profile.changePassword')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="password"
              label={t('profile.currentPassword')}
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              fullWidth
            />
            <TextField
              type="password"
              label={t('profile.newPassword')}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              fullWidth
              helperText={t('profile.minChars')}
            />
            <TextField
              type="password"
              label={t('profile.confirmNewPassword')}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={saving}
          >
            {saving ? t('profile.changingPassword') : t('profile.changePassword')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
