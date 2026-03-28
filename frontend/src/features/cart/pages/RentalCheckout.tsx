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
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { redirectToProductCheckout } from '../services/payment-service'
import { notify } from '../../../shared/services/notification-service'
import { getErrorMessage } from '@/shared/api'

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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rentalData, setRentalData] = useState<RentalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Leer datos del alquiler desde localStorage
    const storedData = localStorage.getItem('rentalCheckoutData')
    if (!storedData) {
      notify.error(t('rentalCheckout.noRentalData'))
      navigate('/rentals')
      return
    }

    try {
      const data = JSON.parse(storedData) as RentalData
      setRentalData(data)
    } catch (err) {
      notify.error(t('rentalCheckout.loadError'))
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
      notify.error(t('rentalCheckout.noRentalData'))
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
          description: t('rentalCheckout.rentalDescription', { bikeName: rentalData.bikeName, days: rentalData.days }),
          // Campos específicos de alquiler
          isRental: true,
          rentalStartDate: rentalData.startDate,
          rentalEndDate: rentalData.endDate,
          rentalDays: rentalData.days,
          depositPaid: rentalData.deposit,
        },
      ]

      // Marcar tipo de checkout para la página de éxito
      localStorage.setItem('lastCheckoutType', 'rental')

      // Redirigir a Stripe Checkout
      await redirectToProductCheckout(rentalData.workshopId, items)

      // Limpiar localStorage después de redirigir
      localStorage.removeItem('rentalCheckoutData')
    } catch (err: unknown) {
      console.error('Error iniciando checkout de alquiler:', err)
      setError(
        getErrorMessage(err, t('checkout.paymentError'))
      )
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {t('rentalCheckout.loginRequired')}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            {t('rentalCheckout.logIn')}
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
            {t('rentalCheckout.loading')}
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          {t('rentalCheckout.title')}
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
                  <Typography variant="h6">{t('rentalCheckout.bike')}</Typography>
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
                  <Typography variant="h6">{t('rentalCheckout.rentalPeriod')}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('rentalCheckout.startDate')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(rentalData.startDate)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('rentalCheckout.returnDate')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(rentalData.endDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('rentalCheckout.duration')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {t('rentalCheckout.daysCount', { count: rentalData.days })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Important Info */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {t('rentalCheckout.importantInfo')}
              </Typography>
              <Typography variant="body2" component="div">
                {t('rentalCheckout.infoPickup')}
                <br />
                {t('rentalCheckout.infoReturn')}
                <br />
                {t('rentalCheckout.infoDeposit')}
                <br />
                {t('rentalCheckout.infoId')}
              </Typography>
            </Alert>
          </Box>

          {/* Right Column - Price Summary */}
          <Box>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('rentalCheckout.paymentSummary')}
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
                    {t('rentalCheckout.pricePerDay')}
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
                    {t('rentalCheckout.rentalDays')}
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
                    {t('rentalCheckout.rentalSubtotal')}
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
                        {t('rentalCheckout.depositRefundable')}
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
                  <Typography variant="h6">{t('rentalCheckout.totalToPay')}</Typography>
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
                    {t('rentalCheckout.depositNote', { amount: formatPrice(rentalData.deposit) })}
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
                  {loading ? t('checkout.redirectingPayment') : t('rentalCheckout.confirmAndPay')}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => navigate(-1)}
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  {t('rentalCheckout.goBack')}
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
