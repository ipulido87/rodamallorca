import { useState, useEffect } from 'react'
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
  TextField,
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
import { useTranslation } from 'react-i18next'
import { getRentalBikes, getRentalFiltersOptions, type RentalBike, type RentalFilters } from '../../../services/rental.service'

export const RentalCatalog = () => {
  const { t } = useTranslation()
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
        setError(t('rentals.loadError'))
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
      road: t('rentals.road'),
      mountain: t('rentals.mountain'),
      hybrid: t('rentals.hybrid'),
      ebike: t('rentals.electric'),
      gravel: t('rentals.gravel'),
      city: t('rentals.cityType'),
    }
    return labels[type] || type
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            🚴 {t('rentals.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('rentals.findPerfectBike')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Filtros laterales */}
          <Box sx={{ width: { xs: '100%', md: '25%' }, flexShrink: 0 }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                {t('common.filter')}
              </Typography>

              {/* Ciudad */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('rentals.city')}</InputLabel>
                <Select
                  value={filters.city || ''}
                  label={t('rentals.city')}
                  onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                >
                  <MenuItem value="">{t('common.allCities')}</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Tipo de bici */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('rentals.bikeType')}</InputLabel>
                <Select
                  value={filters.bikeType || ''}
                  label={t('rentals.bikeType')}
                  onChange={(e) => handleFilterChange('bikeType', e.target.value || undefined)}
                >
                  <MenuItem value="">{t('common.allCities')}</MenuItem>
                  {bikeTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {getBikeTypeLabel(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Fechas */}
              <TextField
                fullWidth
                label={t('common.startDate')}
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('common.endDate')}
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              {/* Accesorios */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includesHelmet || false}
                    onChange={(e) => handleFilterChange('includesHelmet', e.target.checked || undefined)}
                  />
                }
                label={t('rentals.includesHelmet')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includesLock || false}
                    onChange={(e) => handleFilterChange('includesLock', e.target.checked || undefined)}
                  />
                }
                label={t('rentals.includesLock')}
              />

              <Button fullWidth variant="outlined" onClick={clearFilters} sx={{ mt: 2 }}>
                {t('rentals.clearFilters')}
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
                    ? t('rentals.noResults')
                    : t('rentals.comingSoon')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                  {Object.keys(filters).length > 0
                    ? t('rentals.adjustFilters')
                    : t('rentals.workingOnIt')}
                </Typography>

                {Object.keys(filters).length > 0 ? (
                  <Button
                    variant="contained"
                    onClick={clearFilters}
                    sx={{ mt: 2 }}
                    startIcon={<Search />}
                  >
                    {t('rentals.viewAll')}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/catalog')}
                    sx={{ mt: 2 }}
                  >
                    {t('rentals.exploreShop')}
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {bikes.length} {bikes.length !== 1 ? t('rentals.bikes') : t('rentals.bike')} {bikes.length !== 1 ? t('common.availablePlural') : t('common.available')}
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
                    <Box key={bike.id}>
                      <Card
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
                                label={t('common.verified')}
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
                              {bike.bikeSize && `• ${t('rentals.size')} ${bike.bikeSize}`}
                            </Typography>
                          )}

                          {/* Accesorios */}
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                            {bike.includesHelmet && (
                              <Chip icon={<Security />} label={t('rentals.helmet')} size="small" />
                            )}
                            {bike.includesLock && (
                              <Chip icon={<Security />} label={t('rentals.lock')} size="small" />
                            )}
                            {bike.includesLights && (
                              <Chip icon={<Lightbulb />} label={t('rentals.lights')} size="small" />
                            )}
                          </Box>

                          {/* Precio */}
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                              {(bike.rentalPricePerDay / 100).toFixed(0)}€
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('common.perDay')}
                            </Typography>
                          </Box>

                          {bike.rentalPricePerWeek && (
                            <Typography variant="body2" color="text.secondary">
                              {(bike.rentalPricePerWeek / 100).toFixed(0)}€{t('common.perWeek')}
                            </Typography>
                          )}

                          {/* Stock */}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {bike.availableQuantity} {bike.availableQuantity !== 1 ? t('common.availablePlural') : t('common.available')}
                          </Typography>
                        </CardContent>

                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<CalendarMonth />}
                            onClick={() => navigate(`/alquileres/${bike.id}`)}
                          >
                            {t('rentals.viewAvailability')}
                          </Button>
                        </CardActions>
                      </Card>
                    </Box>
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
