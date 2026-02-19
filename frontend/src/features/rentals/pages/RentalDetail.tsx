import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Seo } from '../../../shared/components/Seo'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  DirectionsBike,
  LocationOn,
  CheckCircle,
  Security,
  Lightbulb,
  CalendarMonth,
  AttachMoney,
  Info,
  CheckCircleOutline,
  Phone,
  Language,
  ArrowBack,
} from '@mui/icons-material'
import {
  getRentalBikeDetails,
  checkAvailability,
  calculatePrice,
  type RentalBike,
  type PriceCalculation,
} from '../../../services/rental.service'

export const RentalDetail = () => {
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

  // Cargar detalles de la bici
  useEffect(() => {
    if (!id) return

    setLoading(true)
    getRentalBikeDetails(id)
      .then((response) => {
        setBike(response.bike)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error cargando detalles:', err)
        setError('No se pudo cargar la bicicleta')
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
            `No hay suficientes unidades disponibles. Disponibles: ${availabilityRes.availableQuantity}`
          )
        }
      })
      .catch((err) => {
        console.error('Error verificando disponibilidad:', err)
        setAvailabilityError(err.response?.data?.error || 'Error verificando disponibilidad')
        setChecking(false)
      })
  }, [id, startDate, endDate, quantity])

  const handleReserve = () => {
    if (!bike || !pricing || !available) return

    // Preparar datos para checkout
    const rentalData = {
      bikeId: bike.id,
      bikeName: bike.title,
      bikeImage: bike.images[0]?.original || '/placeholder-bike.jpg',
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
        <Alert severity="error">{error || 'Bicicleta no encontrada'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/rentals')} sx={{ mt: 2 }}>
          Volver al Catálogo
        </Button>
      </Container>
    )
  }

  const bikeImage = bike.images[0]?.original ?? undefined
  const pricePerDay = (bike.rentalPricePerDay / 100).toFixed(0)

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Seo
        title={`${bike.title} — Alquiler ${bike.bikeType ? `Bicicleta ${bike.bikeType === 'road' ? 'Carretera' : bike.bikeType === 'mountain' ? 'Montaña' : bike.bikeType === 'ebike' ? 'Eléctrica' : bike.bikeType === 'gravel' ? 'Gravel' : bike.bikeType} ` : ''}en ${bike.workshop.city ?? 'Mallorca'} | RodaMallorca`}
        description={
          bike.description
            ? `${bike.description.slice(0, 130)}. Desde ${pricePerDay}€/día en ${bike.workshop.name}, ${bike.workshop.city ?? 'Mallorca'}.`
            : `Alquila ${bike.title}${bike.bikeBrand ? ` (${bike.bikeBrand})` : ''} desde ${pricePerDay}€/día en ${bike.workshop.name}. Taller verificado en ${bike.workshop.city ?? 'Mallorca'}.`
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
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://rodamallorca.es/' },
              { '@type': 'ListItem', position: 2, name: 'Alquiler de Bicicletas', item: 'https://rodamallorca.es/alquileres' },
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
          Volver al Catálogo
        </Button>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Columna izquierda: Fotos e info */}
          <Box sx={{ flex: 1 }}>
            {/* Imagen principal */}
            <Card sx={{ mb: 3 }}>
              <Box
                component="img"
                src={bike.images[0]?.original || '/placeholder-bike.jpg'}
                alt={bike.title}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                }}
              />
            </Card>

            {/* Título y badges */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {bike.workshop.isVerified && (
                  <Chip icon={<CheckCircle />} label="Verificado" color="success" />
                )}
                {bike.bikeType && (
                  <Chip icon={<DirectionsBike />} label={getBikeTypeLabel(bike.bikeType)} />
                )}
                {bike.bikeSize && <Chip label={`Talla ${bike.bikeSize}`} />}
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
                  Descripción
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {bike.description}
                </Typography>
              </Paper>
            )}

            {/* Características */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Características
              </Typography>
              <List>
                {bike.frameSize && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutline />
                    </ListItemIcon>
                    <ListItemText primary={`Tamaño del cuadro: ${bike.frameSize}cm`} />
                  </ListItem>
                )}
                {bike.includesHelmet && (
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText primary="Incluye casco" />
                  </ListItem>
                )}
                {bike.includesLock && (
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText primary="Incluye candado" />
                  </ListItem>
                )}
                {bike.includesLights && (
                  <ListItem>
                    <ListItemIcon>
                      <Lightbulb />
                    </ListItemIcon>
                    <ListItemText primary="Incluye luces" />
                  </ListItem>
                )}
              </List>
            </Paper>

            {/* Info del taller */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sobre el Taller
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
                Reserva tu Bicicleta
              </Typography>

              {/* Precio */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {(bike.rentalPricePerDay / 100).toFixed(0)}€
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    / día
                  </Typography>
                </Box>
                {bike.rentalPricePerWeek && (
                  <Typography variant="body2" color="text.secondary">
                    {(bike.rentalPricePerWeek / 100).toFixed(0)}€ por semana
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Selector de fechas */}
              <TextField
                fullWidth
                label="Fecha de Inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Fecha de Fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: startDate || new Date().toISOString().split('T')[0] }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Cantidad"
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
                    ¡Disponible! {bike.availableQuantity} unidades disponibles
                  </Alert>

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
                        + {(pricing.deposit / 100).toFixed(2)}€ de depósito (reembolsable)
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
                Reservar Ahora
              </Button>

              <Alert severity="info" icon={<Info />}>
                <Typography variant="caption">
                  Alquiler mínimo: {bike.minRentalDays} día{bike.minRentalDays !== 1 ? 's' : ''}
                  <br />
                  Alquiler máximo: {bike.maxRentalDays} días
                </Typography>
              </Alert>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
