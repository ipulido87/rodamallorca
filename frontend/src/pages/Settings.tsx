// frontend/src/pages/Settings.tsx
import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Notifications,
  Language,
  Security,
  Palette,
  Store,
  Save,
} from '@mui/icons-material'
import { useState } from 'react'
import useSWR from 'swr'
import { useAuth } from '../features/auth/hooks/useAuth'
import { API } from '../features/auth/services/auth-service'
import { useSnackbar } from '../shared/hooks/use-snackbar'

// Tipos
interface UserSettings {
  notifications: {
    email: {
      orders: boolean
      marketing: boolean
      updates: boolean
    }
    push: {
      orders: boolean
      messages: boolean
    }
  }
  preferences: {
    language: string
    theme: 'light' | 'dark' | 'auto'
  }
  privacy: {
    profileVisible: boolean
    showEmail: boolean
    showPhone: boolean
  }
}

// Servicios API
const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const { data } = await API.get<UserSettings>('/auth/settings')
    return data
  } catch {
    // Si no hay settings guardados, retornar defaults
    return {
      notifications: {
        email: {
          orders: true,
          marketing: false,
          updates: true,
        },
        push: {
          orders: true,
          messages: true,
        },
      },
      preferences: {
        language: 'es',
        theme: 'auto',
      },
      privacy: {
        profileVisible: true,
        showEmail: false,
        showPhone: false,
      },
    }
  }
}

const saveUserSettings = async (settings: UserSettings): Promise<UserSettings> => {
  const { data } = await API.put<UserSettings>('/auth/settings', settings)
  return data
}

export const Settings = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useSnackbar()
  const [saving, setSaving] = useState(false)

  // SWR: Cargar configuración del usuario
  const { data: settings, isLoading, mutate } = useSWR<UserSettings>(
    '/auth/settings',
    getUserSettings,
    {
      revalidateOnFocus: false,
    }
  )

  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null)

  // Usar settings de SWR o locales
  const currentSettings = localSettings || settings

  const handleSave = async () => {
    if (!currentSettings) return

    try {
      setSaving(true)
      const updated = await saveUserSettings(currentSettings)
      mutate(updated, false)
      setLocalSettings(null)
      showSuccess('Configuración guardada correctamente')
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (path: string[], value: any) => {
    if (!currentSettings) return

    const newSettings = { ...currentSettings }
    let obj: any = newSettings

    // Navegar por el path hasta el penúltimo elemento
    for (let i = 0; i < path.length - 1; i++) {
      obj[path[i]] = { ...obj[path[i]] }
      obj = obj[path[i]]
    }

    // Actualizar el valor final
    obj[path[path.length - 1]] = value

    setLocalSettings(newSettings)
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando configuración...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (!currentSettings) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            No se pudo cargar la configuración
          </Alert>
        </Box>
      </Container>
    )
  }

  const hasChanges = localSettings !== null

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Configuración
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personaliza tu experiencia en la plataforma
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Notificaciones */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Notifications color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Notificaciones
                </Typography>
              </Stack>

              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Notificaciones por Email
              </Typography>
              <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSettings.notifications.email.orders}
                      onChange={(e) =>
                        updateSettings(
                          ['notifications', 'email', 'orders'],
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Pedidos y confirmaciones"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSettings.notifications.email.updates}
                      onChange={(e) =>
                        updateSettings(
                          ['notifications', 'email', 'updates'],
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Actualizaciones de productos"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSettings.notifications.email.marketing}
                      onChange={(e) =>
                        updateSettings(
                          ['notifications', 'email', 'marketing'],
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Ofertas y promociones"
                />
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Notificaciones Push
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSettings.notifications.push.orders}
                      onChange={(e) =>
                        updateSettings(
                          ['notifications', 'push', 'orders'],
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Actualizaciones de pedidos"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSettings.notifications.push.messages}
                      onChange={(e) =>
                        updateSettings(
                          ['notifications', 'push', 'messages'],
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Mensajes y comunicaciones"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacidad */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Security color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Privacidad
                </Typography>
              </Stack>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSettings.privacy.profileVisible}
                      onChange={(e) =>
                        updateSettings(
                          ['privacy', 'profileVisible'],
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Perfil visible públicamente"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSettings.privacy.showEmail}
                      onChange={(e) =>
                        updateSettings(['privacy', 'showEmail'], e.target.checked)
                      }
                    />
                  }
                  label="Mostrar email en perfil público"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSettings.privacy.showPhone}
                      onChange={(e) =>
                        updateSettings(['privacy', 'showPhone'], e.target.checked)
                      }
                    />
                  }
                  label="Mostrar teléfono en perfil público"
                />
              </FormGroup>

              <Divider sx={{ my: 3 }} />

              <Alert severity="info" sx={{ mt: 2 }}>
                Tu información personal está protegida y nunca será compartida con
                terceros sin tu consentimiento.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferencias */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Palette color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Apariencia
                </Typography>
              </Stack>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Tema</InputLabel>
                <Select
                  value={currentSettings.preferences.theme}
                  label="Tema"
                  onChange={(e) =>
                    updateSettings(
                      ['preferences', 'theme'],
                      e.target.value as 'light' | 'dark' | 'auto'
                    )
                  }
                >
                  <MenuItem value="light">Claro</MenuItem>
                  <MenuItem value="dark">Oscuro</MenuItem>
                  <MenuItem value="auto">Automático (según sistema)</MenuItem>
                </Select>
              </FormControl>

              <Alert severity="warning">
                La funcionalidad de tema oscuro estará disponible próximamente.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Idioma */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Language color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Idioma
                </Typography>
              </Stack>

              <FormControl fullWidth>
                <InputLabel>Idioma de la interfaz</InputLabel>
                <Select
                  value={currentSettings.preferences.language}
                  label="Idioma de la interfaz"
                  onChange={(e) =>
                    updateSettings(['preferences', 'language'], e.target.value)
                  }
                >
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="en" disabled>
                    English (Próximamente)
                  </MenuItem>
                  <MenuItem value="ca" disabled>
                    Català (Próximamente)
                  </MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Talleres (solo para WORKSHOP_OWNER) */}
        {user?.role === 'WORKSHOP_OWNER' && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Store color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Configuración de Taller
                  </Typography>
                </Stack>

                <Alert severity="info">
                  Las configuraciones específicas de tu taller están disponibles en
                  la sección "Mis Talleres". Desde allí puedes gestionar horarios,
                  servicios, y otra información de tu negocio.
                </Alert>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => (window.location.href = '/my-workshops')}
                  >
                    Ir a Mis Talleres
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Botón Guardar */}
      {hasChanges && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 16,
            mt: 4,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setLocalSettings(null)}
            disabled={saving}
          >
            Descartar Cambios
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </Box>
      )}
    </Container>
  )
}
