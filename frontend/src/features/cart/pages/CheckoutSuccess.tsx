import { CheckCircle } from '@mui/icons-material'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

export const CheckoutSuccess = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const sessionId = searchParams.get('session_id')
  const isRental = localStorage.getItem('lastCheckoutType') === 'rental'

  useEffect(() => {
    if (sessionId) {
      try {
        clearCart()
        localStorage.removeItem('rentalCheckoutData')
        localStorage.removeItem('lastCheckoutType')
      } catch (error) {
        console.error('Error limpiando carrito:', error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <CheckCircle sx={{ fontSize: 120, color: 'success.main' }} />

          <Typography variant="h3" fontWeight="bold">
            {t('checkoutSuccess.title')}
          </Typography>

          <Typography variant="h6" color="text.secondary">
            {isRental ? t('checkoutSuccess.rentalConfirmed') : t('checkoutSuccess.orderConfirmed')}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {isRental
              ? t('checkoutSuccess.rentalDetails')
              : t('checkoutSuccess.orderDetails')}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(isRental ? '/customer-rentals' : '/my-orders')}
            >
              {isRental ? t('checkoutSuccess.viewMyRentals') : t('checkout.viewMyOrders')}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(isRental ? '/alquileres' : '/catalog')}
            >
              {isRental ? t('checkoutSuccess.browseMoreBikes') : t('cart.continueShopping')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}
