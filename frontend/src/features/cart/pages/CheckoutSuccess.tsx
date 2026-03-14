import { CheckCircle } from '@mui/icons-material'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

export const CheckoutSuccess = () => {
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
            ¡Pago Exitoso!
          </Typography>

          <Typography variant="h6" color="text.secondary">
            {isRental ? 'Tu alquiler ha sido confirmado y pagado' : 'Tu pedido ha sido confirmado y pagado'}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {isRental
              ? 'Recibirás un email de confirmación con los detalles del alquiler. Recoge la bicicleta en el taller el día de inicio.'
              : 'Recibirás un email de confirmación con los detalles de tu pedido. El taller comenzará a preparar tu compra.'}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(isRental ? '/customer-rentals' : '/my-orders')}
            >
              {isRental ? 'Ver Mis Alquileres' : 'Ver Mis Pedidos'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(isRental ? '/alquileres' : '/catalog')}
            >
              {isRental ? 'Ver más Bicis' : 'Seguir Comprando'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}
