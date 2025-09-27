import {
  ArrowBack,
  Build,
  Business,
  DirectionsBike,
  Email,
  Language,
  LocationOn,
  Phone,
  Schedule,
  Verified,
} from '@mui/icons-material'
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Rating,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getWorkshopById } from '../../catalog/services/catalog-service'

interface Workshop {
  id: string
  name: string
  description?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  createdAt: string
  rating?: number
  reviewCount?: number
  services?: string[]
  specialties?: string[]
  verified?: boolean
}

export const WorkshopDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const loadWorkshop = async () => {
      try {
        const data = await getWorkshopById(id!)
        setWorkshop(data)
      } catch {
        setError('Error al cargar el taller')
      } finally {
        setLoading(false)
      }
    }

    loadWorkshop()
  }, [id])

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando información del taller...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error || !workshop) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Taller no encontrado'}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/catalog')}
            startIcon={<ArrowBack />}
          >
            Volver al Catálogo
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header con navegación */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate('/catalog')}
            sx={{
              mr: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Detalle del Taller
          </Typography>
        </Box>

        <Stack spacing={4}>
          {/* Card principal del taller */}
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.05
              )} 0%, ${theme.palette.background.paper} 100%)`,
              borderRadius: 3,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={4}
                alignItems="flex-start"
              >
                {/* Avatar del taller */}
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    backgroundColor: theme.palette.primary.main,
                    border: `4px solid ${theme.palette.common.white}`,
                    boxShadow: `0 4px 20px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                  }}
                >
                  <Build sx={{ fontSize: '3rem' }} />
                </Avatar>

                {/* Información principal */}
                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h3" fontWeight="bold">
                      {workshop.name}
                    </Typography>
                    {workshop.verified && (
                      <Chip
                        icon={<Verified />}
                        label="Verificado"
                        color="success"
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>

                  {/* Rating */}
                  {workshop.rating && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <Rating
                        value={workshop.rating}
                        precision={0.1}
                        readOnly
                      />
                      <Typography variant="body1" fontWeight="600">
                        {workshop.rating}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({workshop.reviewCount} reseñas)
                      </Typography>
                    </Stack>
                  )}

                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                  >
                    {workshop.description}
                  </Typography>

                  {/* Información de contacto */}
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {workshop.address}, {workshop.city}, {workshop.country}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="body1">{workshop.phone}</Typography>
                    </Box>

                    {workshop.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {workshop.email}
                        </Typography>
                      </Box>
                    )}

                    {workshop.website && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Language sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {workshop.website}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Business sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="body1">
                        Miembro desde{' '}
                        {new Date(workshop.createdAt).getFullYear()}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Botones de acción */}
                <Stack spacing={2} sx={{ minWidth: 200 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Phone />}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Llamar Ahora
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Email />}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Enviar Email
                  </Button>

                  <Button
                    variant="text"
                    size="large"
                    startIcon={<DirectionsBike />}
                    onClick={() => navigate('/catalog?tab=1')}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Ver Productos
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Servicios y especialidades */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            {/* Servicios */}
            {workshop.services && (
              <Card sx={{ flex: 1, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Servicios
                  </Typography>
                  <Stack spacing={1}>
                    {workshop.services.map((service, index) => (
                      <Chip
                        key={index}
                        label={service}
                        variant="outlined"
                        color="primary"
                        sx={{ justifyContent: 'flex-start' }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Especialidades */}
            {workshop.specialties && (
              <Card sx={{ flex: 1, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Especialidades
                  </Typography>
                  <Stack spacing={1}>
                    {workshop.specialties.map((specialty, index) => (
                      <Chip
                        key={index}
                        label={specialty}
                        variant="filled"
                        color="secondary"
                        sx={{ justifyContent: 'flex-start' }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>

          {/* Horarios (placeholder) */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Horarios de Atención
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Lunes a Viernes: 9:00 - 18:00
                <br />
                Sábados: 9:00 - 14:00
                <br />
                Domingos: Cerrado
              </Typography>
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ mt: 2, display: 'block' }}
              >
                * Los horarios pueden variar en días festivos
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  )
}
