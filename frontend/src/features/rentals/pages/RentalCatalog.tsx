import { useState, useEffect } from 'react'
import { Seo } from '../../../shared/components/Seo'
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  DirectionsBike,
  LocationOn,
  CalendarMonth,
  AttachMoney,
  CheckCircle,
  Security,
  Lightbulb,
  Search,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getRentalBikes, getRentalFiltersOptions, type RentalBike, type RentalFilters } from '../../../services/rental.service'
import { RentalDateRangePicker } from '../components/RentalDateRangePicker'

export const RentalCatalog = () => {
  const navigate = useNavigate()
  const [bikes, setBikes] = useState<RentalBike[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [filters, setFilters] = useState<RentalFilters>({})
  const [cities, setCities] = useState<string[]>([])
  const [bikeTypes, setBikeTypes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })

  // Cargar opciones de filtros
  useEffect(() => {
    getRentalFiltersOptions()
      .then((response) => {
        setCities(response.filters.cities.map((c) => c.city))
        setBikeTypes(response.filters.bikeTypes.map((t) => t.type))
        setPriceRange(response.filters.priceRange)
      })
      .catch((err) => console.error('Error cargando filtros:', err))
  }, [])

  // Cargar bicis
  useEffect(() => {
    setLoading(true)
    setError(null)

    getRentalBikes(filters)
      .then((response) => {
        setBikes(response.bikes)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error cargando bicis:', err)
        setError('Error cargando bicicletas. Intenta de nuevo.')
        setLoading(false)
      })
  }, [filters])

  const handleFilterChange = (key: keyof RentalFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const getBikeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      road: 'Carretera',
      mountain: 'Montaña',
      hybrid: 'Híbrida',
      ebike: 'Eléctrica',
      gravel: 'Gravel',
      city: 'Ciudad',
    }
    return labels[type] || type
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Seo
        title="Alquiler de Bicicletas en Mallorca | RodaMallorca"
        description="Alquila bicicletas de carretera, montaña, eléctricas y gravel en Mallorca. Talleres verificados con bicicletas de calidad. Reserva online y recoge en el taller."
        canonicalPath="/alquileres"
        keywords="alquiler bicicletas Mallorca, alquilar bici Palma, alquiler bicicleta eléctrica Mallorca, bicicleta alquiler Mallorca precio"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://rodamallorca.es/' },
              { '@type': 'ListItem', position: 2, name: 'Alquiler de Bicicletas', item: 'https://rodamallorca.es/alquileres' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Alquiler de Bicicletas en Mallorca',
            description: 'Alquila bicicletas de carretera, montaña, eléctricas y gravel en Mallorca con talleres verificados.',
            url: 'https://rodamallorca.es/alquileres',
            areaServed: {
              '@type': 'Place',
              name: 'Mallorca, Islas Baleares, España',
            },
            provider: {
              '@type': 'Organization',
              name: 'RodaMallorca',
              url: 'https://rodamallorca.es',
            },
            serviceType: 'Alquiler de bicicletas',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '¿Cuánto cuesta alquilar una bicicleta en Mallorca?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'El precio varía según el tipo de bicicleta y el taller. En RodaMallorca encontrarás bicicletas de carretera, montaña, eléctricas y gravel desde diferentes tarifas diarias y semanales. Compara precios y reserva online.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Qué tipos de bicicletas se pueden alquilar en Mallorca?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'En RodaMallorca puedes alquilar bicicletas de carretera, montaña, híbridas, eléctricas (e-bike), gravel y de ciudad. Todos los talleres están verificados y ofrecen bicicletas en perfecto estado.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Se puede alquilar una bicicleta eléctrica en Mallorca?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Sí, en RodaMallorca ofrecemos alquiler de bicicletas eléctricas (e-bike) en Mallorca a través de talleres verificados. Perfectas para explorar la isla sin esfuerzo.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Incluye el alquiler casco y candado?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Depende del taller. En el catálogo puedes filtrar por bicicletas que incluyen casco, candado o luces. Muchos talleres ofrecen estos accesorios incluidos en el precio.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Cómo funciona la reserva de bicicletas en RodaMallorca?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Selecciona la bicicleta, elige las fechas, comprueba la disponibilidad y reserva online. Recibirás confirmación y recoges la bicicleta directamente en el taller en Mallorca.',
                },
              },
            ],
          },
        ]}
      />
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Alquiler de Bicicletas en Mallorca
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Encuentra la bici perfecta para tu aventura
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Filtros laterales */}
          <Box sx={{ width: { xs: '100%', md: '25%' }, flexShrink: 0 }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Filtros
              </Typography>

              {/* Ciudad */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Ciudad</InputLabel>
                <Select
                  value={filters.city || ''}
                  label="Ciudad"
                  onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Tipo de bici */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tipo de Bici</InputLabel>
                <Select
                  value={filters.bikeType || ''}
                  label="Tipo de Bici"
                  onChange={(e) => handleFilterChange('bikeType', e.target.value || undefined)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {bikeTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {getBikeTypeLabel(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Fechas */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Fechas
              </Typography>
              <RentalDateRangePicker
                startDate={filters.startDate || ''}
                endDate={filters.endDate || ''}
                onDatesChange={(start, end) => {
                  setFilters((prev) => ({ ...prev, startDate: start || undefined, endDate: end || undefined }))
                }}
                blockedRanges={[]}
                minDays={1}
                maxDays={365}
              />

              {/* Accesorios */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includesHelmet || false}
                    onChange={(e) => handleFilterChange('includesHelmet', e.target.checked || undefined)}
                  />
                }
                label="Incluye casco"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includesLock || false}
                    onChange={(e) => handleFilterChange('includesLock', e.target.checked || undefined)}
                  />
                }
                label="Incluye candado"
              />

              <Button fullWidth variant="outlined" onClick={clearFilters} sx={{ mt: 2 }}>
                Limpiar Filtros
              </Button>
            </Paper>
          </Box>

          {/* Grid de bicis */}
          <Box sx={{ flex: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : bikes.length === 0 ? (
              <Paper
                sx={{
                  p: 8,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(46, 125, 50, 0.02) 100%)',
                }}
              >
                <DirectionsBike
                  sx={{
                    fontSize: 120,
                    color: 'success.main',
                    opacity: 0.3,
                    mb: 3
                  }}
                />
                <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
                  {Object.keys(filters).length > 0
                    ? 'No hay bicicletas con estos filtros'
                    : 'Próximamente disponible'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                  {Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros o explora todas las opciones disponibles'
                    : 'Estamos trabajando con talleres locales para traerte las mejores bicicletas de alquiler en Mallorca'}
                </Typography>

                {Object.keys(filters).length > 0 ? (
                  <Button
                    variant="contained"
                    onClick={clearFilters}
                    sx={{ mt: 2 }}
                    startIcon={<Search />}
                  >
                    Ver Todas las Bicicletas
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/catalog')}
                    sx={{ mt: 2 }}
                  >
                    Explorar Tienda
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {bikes.length} bicicleta{bikes.length !== 1 ? 's' : ''} disponible{bikes.length !== 1 ? 's' : ''}
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                    },
                    gap: 3,
                  }}
                >
                  {bikes.map((bike) => (
                    <Card
                      key={bike.id}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                        {/* Imagen */}
                        <CardMedia
                          component="img"
                          height="200"
                          image={bike.images[0]?.medium || '/placeholder-bike.jpg'}
                          alt={bike.title}
                          sx={{ objectFit: 'cover' }}
                        />

                        <CardContent sx={{ flexGrow: 1 }}>
                          {/* Badges */}
                          <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {bike.workshop.isVerified && (
                              <Chip
                                icon={<CheckCircle />}
                                label="Verificado"
                                size="small"
                                color="success"
                              />
                            )}
                            {bike.bikeType && (
                              <Chip
                                icon={<DirectionsBike />}
                                label={getBikeTypeLabel(bike.bikeType)}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>

                          {/* Título */}
                          <Typography variant="h6" gutterBottom noWrap>
                            {bike.title}
                          </Typography>

                          {/* Taller y ubicación */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {bike.workshop.name} • {bike.workshop.city}
                            </Typography>
                          </Box>

                          {/* Talla y marca */}
                          {(bike.bikeSize || bike.bikeBrand) && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {bike.bikeBrand && `${bike.bikeBrand} `}
                              {bike.bikeSize && `• Talla ${bike.bikeSize}`}
                            </Typography>
                          )}

                          {/* Accesorios */}
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                            {bike.includesHelmet && (
                              <Chip icon={<Security />} label="Casco" size="small" />
                            )}
                            {bike.includesLock && (
                              <Chip icon={<Security />} label="Candado" size="small" />
                            )}
                            {bike.includesLights && (
                              <Chip icon={<Lightbulb />} label="Luces" size="small" />
                            )}
                          </Box>

                          {/* Precio */}
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                              {(bike.rentalPricePerDay / 100).toFixed(0)}€
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              / día
                            </Typography>
                          </Box>

                          {bike.rentalPricePerWeek && (
                            <Typography variant="body2" color="text.secondary">
                              {(bike.rentalPricePerWeek / 100).toFixed(0)}€/semana
                            </Typography>
                          )}

                          {/* Stock */}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {bike.availableQuantity} disponible{bike.availableQuantity !== 1 ? 's' : ''}
                          </Typography>
                        </CardContent>

                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<CalendarMonth />}
                            onClick={() => navigate(`/alquileres/${bike.id}`)}
                          >
                            Ver Disponibilidad
                          </Button>
                        </CardActions>
                    </Card>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
