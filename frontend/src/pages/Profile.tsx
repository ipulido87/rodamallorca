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
import useSWR from 'swr'
import { useAuth } from '../features/auth/hooks/useAuth'
import { API } from '../features/auth/services/auth-service'
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
      showSuccess('Perfil actualizado correctamente')
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres')
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

      showSuccess('Contraseña cambiada correctamente')
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al cambiar contraseña')
    } finally {
      setSaving(false)
    }
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'WORKSHOP_OWNER':
        return 'Propietario de Taller'
      case 'ADMIN':
        return 'Administrador'
      default:
        return 'Usuario'
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
            Cargando perfil...
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
            No se pudo cargar la información del perfil
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
          Mi Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona tu información personal
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
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    ) : (
                      <>
                        <Typography variant="h5" fontWeight="bold">
                          {user.name || 'Sin nombre'}
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
                    Email
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email color="action" />
                    <Typography variant="body1">{user.email}</Typography>
                    {user.verified && (
                      <Chip
                        icon={<Verified />}
                        label="Verificado"
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
                    Teléfono
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      placeholder="Ej: +34 600 000 000"
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
                        {user.phone || 'No especificado'}
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
                    Fecha de Nacimiento
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
                          : 'No especificada'}
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
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleEditToggle}
                        disabled={saving}
                        fullWidth
                      >
                        Cancelar
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
                  Información de Cuenta
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Rol
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        icon={<Person />}
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Miembro desde
                    </Typography>
                    <Typography variant="body2">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Desconocido'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Última actualización
                    </Typography>
                    <Typography variant="body2">
                      {user.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Desconocido'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Seguridad */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Seguridad
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialog(true)}
                  fullWidth
                >
                  Cambiar Contraseña
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
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="password"
              label="Contraseña Actual"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              fullWidth
            />
            <TextField
              type="password"
              label="Nueva Contraseña"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              fullWidth
              helperText="Mínimo 6 caracteres"
            />
            <TextField
              type="password"
              label="Confirmar Nueva Contraseña"
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
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={saving}
          >
            {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
