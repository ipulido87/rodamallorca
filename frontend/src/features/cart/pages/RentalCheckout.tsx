import { CalendarMonth, TwoWheeler } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Typography,
  Alert,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { redirectToProductCheckout } from '../services/payment-service'
import { notify } from '../../../shared/services/notification-service'

interface RentalData {
  bikeId: string
  bikeName: string
  bikeImage?: string
  startDate: string
  endDate: string
  days: number
  totalPrice: number
  deposit: number
  workshopId: string
  workshopName: string
  pricePerDay: number
}

export const RentalCheckout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rentalData, setRentalData] = useState<RentalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Leer datos del alquiler desde localStorage
    const storedData = localStorage.getItem('rentalCheckoutData')
    if (!storedData) {
      notify.error('No se encontraron datos de alquiler')
      navigate('/rentals')
      return
    }

    try {
      const data = JSON.parse(storedData) as RentalData
      setRentalData(data)
    } catch (err) {
      notify.error('Error al cargar los datos del alquiler')
      navigate('/rentals')
    }
  }, [navigate])

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0.00€'
    }
    return `${(price / 100).toFixed(2)}€`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleConfirmRental = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!rentalData) {
      notify.error('No hay datos de alquiler')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Preparar item de alquiler para Stripe
      const items = [
        {
          productId: rentalData.bikeId,
          quantity: 1,
          priceAtOrder: rentalData.totalPrice,
          currency: 'EUR',
          description: `Alquiler ${rentalData.bikeName} (${rentalData.days} ${rentalData.days === 1 ? 'día' : 'días'})`,
          // Campos específicos de alquiler
          isRental: true,
          rentalStartDate: rentalData.startDate,
          rentalEndDate: rentalData.endDate,
          rentalDays: rentalData.days,
          depositPaid: rentalData.deposit,
        },
      ]

      // Redirigir a Stripe Checkout
      await redirectToProductCheckout(rentalData.workshopId, items)

      // Limpiar localStorage después de redirigir
      localStorage.removeItem('rentalCheckoutData')
    } catch (err: any) {
      console.error('Error iniciando checkout de alquiler:', err)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Error al iniciar el pago. Por favor intenta de nuevo.'
      )
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Inicia sesión para continuar con el alquiler
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </Button>
        </Box>
      </Container>
    )
  }

  if (!rentalData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Cargando datos del alquiler...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Confirmar Alquiler
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3,
          }}
        >
          {/* Left Column - Rental Details */}
          <Box>
            {/* Bike Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TwoWheeler sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Bicicleta</Typography>
                </Box>
                {rentalData.bikeImage && (
                  <Box
                    component="img"
                    src={rentalData.bikeImage}
                    alt={rentalData.bikeName}
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mb: 2,
                    }}
                  />
                )}
                <Typography variant="h6" gutterBottom>
                  {rentalData.bikeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {rentalData.workshopName}
                </Typography>
              </CardContent>
            </Card>

            {/* Rental Period */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarMonth sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Período de Alquiler</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de inicio
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(rentalData.startDate)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de devolución
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(rentalData.endDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Duración
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {rentalData.days} {rentalData.days === 1 ? 'día' : 'días'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Important Info */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Información importante:
              </Typography>
              <Typography variant="body2" component="div">
                • La bicicleta debe recogerse el día de inicio en el taller
                <br />
                • Debes devolver la bicicleta antes de las 18:00 del último día
                <br />
                • El depósito se devolverá tras verificar el estado de la
                bicicleta
                <br />• Trae tu DNI/pasaporte y carnet de conducir al recoger
                la bicicleta
              </Typography>
            </Alert>
          </Box>

          {/* Right Column - Price Summary */}
          <Box>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen de Pago
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Price Breakdown */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Precio por día:
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(rentalData.pricePerDay)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Días de alquiler:
                  </Typography>
                  <Typography variant="body2">{rentalData.days}</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    Subtotal alquiler:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatPrice(rentalData.totalPrice)}
                  </Typography>
                </Box>

                {rentalData.deposit && rentalData.deposit > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />

                    {/* Deposit */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        Depósito (reembolsable):
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatPrice(rentalData.deposit)}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                  </>
                )}

                {/* Total */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 3,
                  }}
                >
                  <Typography variant="h6">Total a pagar:</Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {formatPrice(rentalData.totalPrice + (rentalData.deposit || 0))}
                  </Typography>
                </Box>

                {rentalData.deposit && rentalData.deposit > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 3 }}
                  >
                    El depósito de {formatPrice(rentalData.deposit)} se devolverá
                    cuando devuelvas la bicicleta en buen estado.
                  </Typography>
                )}

                {error && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      bgcolor: 'error.light',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="error.dark">
                      {error}
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleConfirmRental}
                  disabled={loading}
                >
                  {loading ? 'Redirigiendo a pago...' : 'Confirmar y Pagar'}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => navigate(-1)}
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Volver
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
