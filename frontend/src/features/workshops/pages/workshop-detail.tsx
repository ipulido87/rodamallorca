import {
  ArrowBack,
  Build,
  Business,
  DirectionsBike,
  Email,
  Language,
  LocationOn,
  Phone,
  RateReview,
  Schedule,
  ShoppingCart,
  Verified,
} from '@mui/icons-material'
import { Seo } from '../../../shared/components/Seo'
import { getOptimizedImageUrl } from '../../../shared/utils/cloudinary'
import { getWorkshopPlaceholder } from '../../../shared/utils/placeholder'
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
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR from 'swr'
import {
  getWorkshopById,
  searchProducts,
  searchServices,
} from '../../catalog/services/catalog-service'
import type { Product, Service } from '../../catalog/types/catalog'
import type { CardService } from '../../products/types/products-types'
import { ModernProductLayout, ModernServiceLayout } from '../../products/components/modern-product-layout'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { ReviewForm } from '../../reviews/components/review-form'
import { ReviewList } from '../../reviews/components/review-list'
import { useAuth } from '../../auth/hooks/useAuth'

interface Workshop {
  id: string
  ownerId: string
  name: string
  description?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  logoOriginal?: string
  logoMedium?: string
  logoThumbnail?: string
  averageRating?: number
  reviewCount?: number
  createdAt: string
  rating?: number
  services?: string[]
  specialties?: string[]
  verified?: boolean
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </Box>
)

const adaptProductForLayout = (product: Product) => ({
  id: product.id,
  title: product.title,
  price: product.price,
  condition: 'used' as const,
  status: product.status,
  images: adaptProductImages(product.images),
  workshop: {
    name: product.workshop.name,
    city: product.workshop.city,
  },
})

export const WorkshopDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [reviewRefresh, setReviewRefresh] = useState(0)

  // SWR: Cargar información del taller
  const { data: workshop, error, isLoading: loading } = useSWR<Workshop>(
    id ? `/workshops/${id}` : null,
    () => getWorkshopById(id!),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  // SWR: Cargar productos solo cuando el tab de productos está activo
  const { data: productsData, isLoading: productsLoading } = useSWR(
    id && tabValue === 1 ? `/workshops/${id}/products` : null,
    async () => {
      const response = await searchProducts({ workshopId: id!, size: 20 })
      return response.items
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  )

  // SWR: Cargar servicios solo cuando el tab de servicios está activo
  const { data: servicesData, isLoading: servicesLoading } = useSWR(
    id && tabValue === 2 ? `/workshops/${id}/services` : null,
    async () => {
      const response = await searchServices({ workshopId: id!, size: 20 })
      return response.items
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  )

  const products = productsData || []
  const services: CardService[] = (servicesData || []).map((s: Service) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? undefined,
    price: s.price,
    duration: s.duration ?? undefined,
    vehicleType: s.vehicleType,
    workshop: s.workshop
      ? { id: s.workshop.id, name: s.workshop.name, city: s.workshop.city ?? undefined }
      : { id: id!, name: workshop?.name ?? '', city: workshop?.city ?? undefined },
    serviceCategory: s.serviceCategory
      ? { id: s.serviceCategory.id, name: s.serviceCategory.name, icon: s.serviceCategory.icon ?? undefined }
      : { id: s.serviceCategoryId, name: '' },
  }))

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

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

  if (error || (!loading && !workshop)) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error?.message || 'Taller no encontrado'}
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

  const workshopImage = workshop.logoOriginal ?? workshop.logoMedium ?? undefined

  return (
    <Container maxWidth="lg">
      <Seo
        title={`${workshop.name} | Taller de Bicicletas en ${workshop.city ?? 'Mallorca'} | RodaMallorca`}
        description={
          workshop.description
            ? `${workshop.description.slice(0, 140)}. Taller en ${workshop.city ?? 'Mallorca'}.`
            : `${workshop.name} — taller de bicicletas verificado en ${workshop.city ?? 'Mallorca'}. Reparación, mantenimiento y venta de componentes.`
        }
        canonicalPath={`/workshop/${workshop.id}`}
        keywords={`${workshop.name}, taller bicicletas ${workshop.city ?? 'Mallorca'}, reparación bicicleta ${workshop.city ?? 'Mallorca'}, mecánico bicicletas Mallorca`}
        image={workshopImage}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          '@id': `https://rodamallorca.com/workshop/${workshop.id}`,
          name: workshop.name,
          description: workshop.description ?? undefined,
          image: workshopImage,
          url: `https://rodamallorca.com/workshop/${workshop.id}`,
          telephone: workshop.phone ?? undefined,
          email: workshop.email ?? undefined,
          address: {
            '@type': 'PostalAddress',
            streetAddress: workshop.address ?? undefined,
            addressLocality: workshop.city ?? 'Mallorca',
            addressCountry: 'ES',
          },
          ...(workshop.averageRating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: workshop.averageRating,
              reviewCount: workshop.reviewCount ?? 1,
            },
          }),
        }}
      />
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
                  src={getOptimizedImageUrl(workshop.logoMedium, 'logo', workshop.id) || getWorkshopPlaceholder(workshop.id)}
                  alt={workshop.name}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    backgroundColor: 'transparent',
                    border: `4px solid ${theme.palette.common.white}`,
                    boxShadow: `0 4px 20px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                  }}
                />

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
                    startIcon={<ShoppingCart />}
                    onClick={() => setTabValue(1)}
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

          {/* Tabs de contenido */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Información" icon={<Business />} iconPosition="start" />
              <Tab label="Productos" icon={<ShoppingCart />} iconPosition="start" />
              <Tab label="Servicios" icon={<Build />} iconPosition="start" />
              <Tab label="Opiniones" icon={<RateReview />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Tab Panel: Información */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={4}>
              {/* Servicios y especialidades */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* Servicios */}
                {workshop.services && (
                  <Card sx={{ flex: 1, borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Servicios Destacados
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

              {/* Horarios */}
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
          </TabPanel>

          {/* Tab Panel: Productos */}
          <TabPanel value={tabValue} index={1}>
            {productsLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Cargando productos...
                </Typography>
              </Box>
            ) : products.length > 0 ? (
              <ModernProductLayout
                products={products.map(adaptProductForLayout)}
                loading={false}
                emptyMessage="Este taller no tiene productos disponibles"
              />
            ) : (
              <Alert severity="info">
                Este taller no tiene productos publicados en este momento.
              </Alert>
            )}
          </TabPanel>

          {/* Tab Panel: Servicios */}
          <TabPanel value={tabValue} index={2}>
            {servicesLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Cargando servicios...
                </Typography>
              </Box>
            ) : services.length > 0 ? (
              <ModernServiceLayout
                services={services}
                loading={false}
                emptyMessage="Este taller no tiene servicios disponibles"
              />
            ) : (
              <Alert severity="info">
                Este taller no tiene servicios publicados en este momento.
              </Alert>
            )}
          </TabPanel>

          {/* Tab Panel: Opiniones */}
          <TabPanel value={tabValue} index={3}>
            {user && workshop && user.id !== workshop.ownerId && (
              <ReviewForm
                workshopId={id!}
                onReviewCreated={() => setReviewRefresh((prev) => prev + 1)}
              />
            )}
            <ReviewList workshopId={id!} refreshTrigger={reviewRefresh} />
          </TabPanel>
        </Stack>
      </Box>
    </Container>
  )
}
