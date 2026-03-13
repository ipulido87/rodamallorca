import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  Divider,
} from '@mui/material'
import { AxiosError } from 'axios'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getMyWorkshopById,
  updateWorkshop,
  type CreateWorkshopData,
  type Workshop,
} from '../services/workshop-service'
import { WorkshopLogoUpload } from '../components/workshop-logo-upload'
import type { ProcessedImage } from '../../media/services/media-service'

export const EditWorkshop = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [workshop, setWorkshop] = useState<Workshop | null>(null)

  const [formData, setFormData] = useState<CreateWorkshopData>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
  })

  const [logoData, setLogoData] = useState<ProcessedImage | null>(null)

  // Cargar datos del workshop al montar el componente
  useEffect(() => {
    if (!id) {
      setError(t('workshops.invalidWorkshopId'))
      setInitialLoading(false)
      return
    }

    const loadWorkshop = async () => {
      try {
        setInitialLoading(true)
        // Usar la ruta de owner para verificar que es del usuario
        const data = await getMyWorkshopById(id)
        setWorkshop(data)

        // Pre-poblar el formulario con los datos existentes
        setFormData({
          name: data.name,
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          phone: data.phone || '',
        })

        // Cargar logo si existe
        if (data.logoOriginal && data.logoMedium && data.logoThumbnail) {
          setLogoData({
            original: data.logoOriginal,
            medium: data.logoMedium,
            thumbnail: data.logoThumbnail,
          })
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err.response?.status === 404) {
            setError(t('workshops.workshopNotFound'))
          } else if (err.response?.status === 403) {
            setError(t('workshops.noEditPermission'))
          } else {
            setError(t('workshops.errorLoadingWorkshop'))
          }
        } else {
          setError(t('workshops.errorLoadingWorkshop'))
        }
      } finally {
        setInitialLoading(false)
      }
    }

    loadWorkshop()
  }, [id])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (logo: ProcessedImage | null) => {
    setLogoData(logo)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return

    setLoading(true)
    setError('')

    try {
      await updateWorkshop(id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        country: formData.country?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        logoOriginal: logoData?.original || undefined,
        logoMedium: logoData?.medium || undefined,
        logoThumbnail: logoData?.thumbnail || undefined,
      })

      setSuccess(t('workshops.workshopUpdated'))
      setTimeout(() => navigate('/my-workshops'), 1500)
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 404) {
          setError(t('workshops.workshopNotFound'))
        } else if (err.response?.status === 403) {
          setError(t('workshops.noEditPermission'))
        } else {
          setError(
            err.response?.data?.message || t('workshops.errorUpdatingWorkshop')
          )
        }
      } else {
        setError(t('workshops.errorUpdatingWorkshop'))
      }
    } finally {
      setLoading(false)
    }
  }

  // Loading inicial
  if (initialLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('workshops.loadingWorkshopInfo')}
          </Typography>
        </Box>
      </Container>
    )
  }

  // Error al cargar
  if (error && !workshop) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/my-workshops')}>
            {t('workshops.backToMyWorkshops')}
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('workshops.editWorkshop')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/my-workshops')}>
            {t('common.back')}
          </Button>
        </Box>

        {workshop && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('workshops.editing')}: <strong>{workshop.name}</strong>
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Logo Upload */}
          <WorkshopLogoUpload
            currentLogo={logoData?.medium || null}
            onLogoChange={handleLogoChange}
            disabled={loading}
          />

          <Divider sx={{ my: 3 }} />

          <TextField
            label={t('workshops.workshopName')}
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            disabled={loading}
          />

          <TextField
            label={t('workshops.description')}
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            fullWidth
            multiline
            rows={3}
            disabled={loading}
          />

          <TextField
            label={t('workshops.address')}
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            fullWidth
            disabled={loading}
          />

          <TextField
            label={t('workshops.city')}
            name="city"
            value={formData.city}
            onChange={handleChange}
            margin="normal"
            fullWidth
            disabled={loading}
          />

          <TextField
            label={t('workshops.countryCode')}
            name="country"
            value={formData.country}
            onChange={handleChange}
            margin="normal"
            fullWidth
            inputProps={{ maxLength: 2 }}
            disabled={loading}
          />

          <TextField
            label={t('workshops.phone')}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            fullWidth
            type="tel"
            disabled={loading}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? t('workshops.updating') : t('workshops.updateWorkshop')}
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/my-workshops')}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
