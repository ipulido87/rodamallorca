import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { Seo } from '../../../shared/components/Seo'
import { BikeImage } from '../../../shared/components/BikeImage'
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@mui/material'
import {
  DirectionsBike,
  LocationOn,
  CheckCircle,
  Security,
  Lightbulb,
  Info,
  CheckCircleOutline,
  Phone,
  ArrowBack,
  EventBusy,
  Savings,
} from '@mui/icons-material'
import {
  getRentalBikeDetails,
  checkAvailability,
  calculatePrice,
  getBlockedDates,
  type RentalBike,
  type PriceCalculation,
  type BlockedDate,
} from '../../../services/rental.service'
import { RentalDateRangePicker } from '../components/RentalDateRangePicker'

export const RentalDetail = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [bike, setBike] = useState<RentalBike | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Selector de fechas
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Disponibilidad y precio
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [pricing, setPricing] = useState<PriceCalculation | null>(null)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  // Fechas bloqueadas
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])

  // Cargar detalles de la bici
  useEffect(() => {
    if (!id) return

    setLoading(true)
    Promise.all([
      getRentalBikeDetails(id),
      getBlockedDates(id).catch(() => ({ blockedDates: [] })),
    ])
      .then(([bikeResponse, blockedResponse]) => {
        setBike(bikeResponse.bike)
        setBlockedDates(blockedResponse.blockedDates ?? [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error cargando detalles:', err)
        setError(t('rentalDetail.loadError'))
        setLoading(false)
      })
  }, [id])

  // Verificar disponibilidad cuando cambien las fechas
  useEffect(() => {
    if (!id || !startDate || !endDate) {
      setAvailable(null)
      setPricing(null)
      return
    }

    setChecking(true)
    setAvailabilityError(null)

    Promise.all([
      checkAvailability(id, startDate, endDate, quantity),
      calculatePrice(id, startDate, endDate),
    ])
      .then(([availabilityRes, pricingRes]) => {
        setAvailable(availabilityRes.available)
        setPricing(pricingRes)
        setChecking(false)

        if (!availabilityRes.available) {
          setAvailabilityError(
            t('rentalDetail.notEnoughUnits', { available: availabilityRes.availableQuantity })
          )
        }
      })
      .catch((err) => {
        console.error('Error verificando disponibilidad:', err)
        setAvailabilityError(err.response?.data?.error || t('rentalDetail.availabilityError'))
        setChecking(false)
      })
  }, [id, startDate, endDate, quantity])

  const handleReserve = () => {
    if (!bike || !pricing || !available) return

    // Preparar datos para checkout
    const rentalData = {
      bikeId: bike.id,
      bikeName: bike.title,
      bikeImage: bike.images[0]?.original ?? '',
      workshopId: bike.workshop.id,
      workshopName: bike.workshop.name,
      startDate,
      endDate,
      days: pricing.days,
      pricePerDay: pricing.pricePerDay,
      totalPrice: pricing.totalPrice,
      deposit: pricing.deposit || 0,
      quantity,
    }

    // Guardar en localStorage para el checkout
    localStorage.setItem('rentalCheckoutData', JSON.stringify(rentalData))

    // Redirigir al checkout
    navigate('/checkout/rental')
  }

  const formatDateShort = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  const fullyBlockedRanges = bike
    ? blockedDates.filter((b) => b.quantityBlocked >= bike.availableQuantity)
    : []

  const getBikeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      road: t('rentals.bikeType.road'),
      mountain: t('rentals.bikeType.mountain'),
      hybrid: t('rentals.bikeType.hybrid'),
      ebike: t('rentals.bikeType.ebike'),
      gravel: t('rentals.bikeType.gravel'),
      city: t('rentals.bikeType.city'),
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !bike) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error || t('rentalDetail.bikeNotFound')}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/rentals')} sx={{ mt: 2 }}>
          {t('rentalDetail.backToCatalog')}
        </Button>
      </Container>
    )
  }

  const bikeImage = bike.images[0]?.original ?? undefined
  const pricePerDay = (bike.rentalPricePerDay / 100).toFixed(0)

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Seo
        title={`${bike.title} — ${t('rentalDetail.seo.rental')} ${bike.bikeType ? `${t('rentalDetail.seo.bicycle')} ${getBikeTypeLabel(bike.bikeType)} ` : ''}${t('rentalDetail.seo.in')} ${bike.workshop.city ?? 'Mallorca'} | RodaMallorca`}
        description={
          bike.description
            ? `${bike.description.slice(0, 130)}. ${t('rentalDetail.seo.priceFrom', { price: pricePerDay, workshop: bike.workshop.name, city: bike.workshop.city ?? 'Mallorca' })}`
            : t('rentalDetail.seo.defaultDescription', { title: bike.title, brand: bike.bikeBrand ? ` (${bike.bikeBrand})` : '', price: pricePerDay, workshop: bike.workshop.name, city: bike.workshop.city ?? 'Mallorca' })
        }
        canonicalPath={`/alquileres/${bike.id}`}
        keywords={`alquiler ${bike.title} Mallorca, ${bike.bikeType ? `alquiler bicicleta ${bike.bikeType} Mallorca` : 'alquiler bicicleta Mallorca'}, ${bike.workshop.city ?? 'Mallorca'} bici alquiler`}
        image={bikeImage}
        ogType="product"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t('rentalDetail.seo.home'), item: 'https://rodamallorca.es/' },
              { '@type': 'ListItem', position: 2, name: t('rentalDetail.seo.bikeRentals'), item: 'https://rodamallorca.es/alquileres' },
              { '@type': 'ListItem', position: 3, name: bike.title, item: `https://rodamallorca.es/alquileres/${bike.id}` },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: bike.title,
            description: bike.description ?? undefined,
            image: bikeImage,
            url: `https://rodamallorca.es/alquileres/${bike.id}`,
            brand: bike.bikeBrand ? { '@type': 'Brand', name: bike.bikeBrand } : undefined,
            offers: [
              {
                '@type': 'Offer',
                price: pricePerDay,
                priceCurrency: 'EUR',
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: pricePerDay,
                  priceCurrency: 'EUR',
                  unitText: 'DAY',
                },
                availability: 'https://schema.org/InStock',
                url: `https://rodamallorca.es/alquileres/${bike.id}`,
                seller: {
                  '@type': 'LocalBusiness',
                  name: bike.workshop.name,
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: bike.workshop.address ?? undefined,
                    addressLocality: bike.workshop.city ?? 'Mallorca',
                    addressCountry: 'ES',
                  },
                },
              },
              ...(bike.rentalPricePerWeek
                ? [
                    {
                      '@type': 'Offer',
                      price: (bike.rentalPricePerWeek / 100).toFixed(0),
                      priceCurrency: 'EUR',
                      priceSpecification: {
                        '@type': 'UnitPriceSpecification',
                        price: (bike.rentalPricePerWeek / 100).toFixed(0),
                        priceCurrency: 'EUR',
                        unitText: 'WK',
                      },
                      availability: 'https://schema.org/InStock',
                      url: `https://rodamallorca.es/alquileres/${bike.id}`,
                      seller: {
                        '@type': 'LocalBusiness',
                        name: bike.workshop.name,
                      },
                    },
                  ]
                : []),
            ],
          },
        ]}
      />
      <Container maxWidth="lg">
        {/* Botón volver */}
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/rentals')} sx={{ mb: 3 }}>
          {t('rentalDetail.backToCatalog')}
        </Button>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Columna izquierda: Fotos e info */}
          <Box sx={{ flex: 1 }}>
            {/* Imagen principal */}
            <Card sx={{ mb: 3, overflow: 'hidden' }}>
              <BikeImage
                src={bike.images[0]?.original}
                preset="detail"
                bikeType={bike.bikeType}
                alt={bike.title}
                height={400}
              />
            </Card>

            {/* Título y badges */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {bike.workshop.isVerified && (
                  <Chip icon={<CheckCircle />} label={t('rentalDetail.verified')} color="success" />
                )}
                {bike.bikeType && (
                  <Chip icon={<DirectionsBike />} label={getBikeTypeLabel(bike.bikeType)} />
                )}
                {bike.bikeSize && <Chip label={t('rentalDetail.size', { size: bike.bikeSize })} />}
              </Box>

              <Typography variant="h4" gutterBottom fontWeight="bold">
                {bike.title}
              </Typography>

              {bike.bikeBrand && (
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {bike.bikeBrand}
                  {bike.bikeModel && ` - ${bike.bikeModel}`}
                </Typography>
              )}
            </Box>

            {/* Descripción */}
            {bike.description && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('rentalDetail.description')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {bike.description}
                </Typography>
              </Paper>
            )}

            {/* Características */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('rentalDetail.features')}
              </Typography>
              <List>
                {bike.frameSize && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutline />
                    </ListItemIcon>
                    <ListItemText primary={t('rentalDetail.frameSize', { size: bike.frameSize })} />
                  </ListItem>
                )}
                {bike.includesHelmet && (
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText primary={t('rentalDetail.includesHelmet')} />
                  </ListItem>
                )}
                {bike.includesLock && (
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText primary={t('rentalDetail.includesLock')} />
                  </ListItem>
                )}
                {bike.includesLights && (
                  <ListItem>
                    <ListItemIcon>
                      <Lightbulb />
                    </ListItemIcon>
                    <ListItemText primary={t('rentalDetail.includesLights')} />
                  </ListItem>
                )}
              </List>
            </Paper>

            {/* Fechas no disponibles */}
            {fullyBlockedRanges.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EventBusy color="warning" fontSize="small" />
                  <Typography variant="h6">{t('rentalDetail.unavailableDates')}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('rentalDetail.bikeAlreadyBooked')}
                </Typography>
                {fullyBlockedRanges.map((b, i) => (
                  <Chip
                    key={i}
                    label={`${formatDateShort(b.startDate)} → ${formatDateShort(b.endDate)}`}
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Paper>
            )}

            {/* Info del taller */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('rentalDetail.aboutWorkshop')}
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary={bike.workshop.name}
                    secondary={`${bike.workshop.address || ''} ${bike.workshop.city || ''}`}
                  />
                </ListItem>
                {bike.workshop.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText primary={bike.workshop.phone} />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>

          {/* Columna derecha: Reserva */}
          <Box sx={{ width: { xs: '100%', md: '400px' }, flexShrink: 0 }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {t('rentalDetail.reserveYourBike')}
              </Typography>

              {/* Precio */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {(bike.rentalPricePerDay / 100).toFixed(0)}€
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {t('rentalDetail.perDay')}
                  </Typography>
                </Box>
                {bike.rentalPricePerWeek && (
                  <Typography variant="body2" color="text.secondary">
                    {t('rentalDetail.pricePerWeek', { price: (bike.rentalPricePerWeek / 100).toFixed(0) })}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Selector de fechas */}
              <RentalDateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDatesChange={(start, end) => {
                  setStartDate(start)
                  setEndDate(end)
                }}
                blockedRanges={fullyBlockedRanges}
                minDays={bike.minRentalDays}
                maxDays={bike.maxRentalDays}
              />

              <TextField
                fullWidth
                label={t('rentalDetail.quantity')}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: bike.availableQuantity }}
                sx={{ mb: 3 }}
              />

              {/* Resultado de disponibilidad */}
              {checking && (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={30} />
                </Box>
              )}

              {availabilityError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {availabilityError}
                </Alert>
              )}

              {available && pricing && (
                <Box sx={{ mb: 3 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {t('rentalDetail.available', { count: bike.availableQuantity })}
                  </Alert>

                  {pricing.pricePerWeek && pricing.days >= 7 && (
                    <Chip
                      icon={<Savings />}
                      label={t('rentalDetail.weeklyRateApplied')}
                      color="success"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2, width: '100%' }}
                    />
                  )}

                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {pricing.breakdown}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 2,
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {(pricing.totalPrice / 100).toFixed(2)}€
                      </Typography>
                    </Box>

                    {pricing.deposit && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {t('rentalDetail.depositRefundable', { amount: (pricing.deposit / 100).toFixed(2) })}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}

              {/* Botón de reserva */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<CheckCircle />}
                disabled={!available || checking}
                onClick={handleReserve}
                sx={{ mb: 2 }}
              >
                {t('rentalDetail.reserveNow')}
              </Button>

              <Alert severity="info" icon={<Info />}>
                <Typography variant="caption">
                  {t('rentalDetail.minRental', { days: bike.minRentalDays })}
                  <br />
                  {t('rentalDetail.maxRental', { days: bike.maxRentalDays })}
                </Typography>
              </Alert>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
