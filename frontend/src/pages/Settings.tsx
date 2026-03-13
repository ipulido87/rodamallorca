// frontend/src/pages/Settings.tsx
import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'

import {
  Notifications,
  Security,
  Store,
  Save,
} from '@mui/icons-material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import { useAuth } from '../features/auth/hooks/useAuth'
import { API, getErrorMessage } from '@/shared/api'
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
  const { t } = useTranslation()
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
      showSuccess(t('settings.saved'))
    } catch (error: unknown) {
      showError(getErrorMessage(error, t('settings.saveError')))
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (path: string[], value: unknown) => {
    if (!currentSettings) return

    const newSettings = { ...currentSettings }
    let obj: Record<string, unknown> = newSettings as Record<string, unknown>

    // Navegar por el path hasta el penúltimo elemento
    for (let i = 0; i < path.length - 1; i++) {
      obj[path[i]] = { ...(obj[path[i]] as Record<string, unknown>) }
      obj = obj[path[i]] as Record<string, unknown>
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
            {t('settings.loadingSettings')}
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
            {t('settings.loadError')}
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
          {t('settings.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('settings.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {/* Notificaciones */}
        <Box sx={{ width: { xs: "100%", md: "50%" }, flexGrow: 1 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Notifications color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  {t('settings.notifications')}
                </Typography>
              </Stack>

              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                {t('settings.emailNotifications')}
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
                  label={t('settings.ordersAndConfirmations')}
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
                  label={t('settings.productUpdates')}
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
                  label={t('settings.offersAndPromotions')}
                />
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                {t('settings.pushNotifications')}
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
                  label={t('settings.orderUpdates')}
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
                  label={t('settings.messagesAndComms')}
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Box>

        {/* Privacidad */}
        <Box sx={{ width: { xs: "100%", md: "50%" }, flexGrow: 1 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Security color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  {t('settings.privacy')}
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
                  label={t('settings.profileVisible')}
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
                  label={t('settings.showEmailPublic')}
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
                  label={t('settings.showPhonePublic')}
                />
              </FormGroup>

              <Divider sx={{ my: 3 }} />

              <Alert severity="info" sx={{ mt: 2 }}>
                {t('settings.privacyNote')}
              </Alert>
            </CardContent>
          </Card>
        </Box>

        {/* Talleres (solo para WORKSHOP_OWNER) */}
        {user?.role === 'WORKSHOP_OWNER' && (
          <Box sx={{ width: "100%", flexGrow: 1 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Store color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    {t('settings.workshopSettings')}
                  </Typography>
                </Stack>

                <Alert severity="info">
                  {t('settings.workshopSettingsNote')}
                </Alert>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => (window.location.href = '/my-workshops')}
                  >
                    {t('settings.goToMyWorkshops')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

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
            {t('settings.discardChanges')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('settings.saving') : t('settings.saveSettings')}
          </Button>
        </Box>
      )}
    </Container>
  )
}
