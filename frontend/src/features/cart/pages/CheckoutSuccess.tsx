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

  useEffect(() => {
    // Limpiar carrito cuando llega a la página de éxito
    if (sessionId) {
      try {
        clearCart()
        // Limpiar también el localStorage del rental checkout si existe
        localStorage.removeItem('rentalCheckoutData')
      } catch (error) {
        console.error('Error limpiando carrito:', error)
        // No bloquear la UI si hay error
      }
    }
  }, [sessionId, clearCart])

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <CheckCircle sx={{ fontSize: 120, color: 'success.main' }} />

          <Typography variant="h3" fontWeight="bold">
            ¡Pago Exitoso!
          </Typography>

          <Typography variant="h6" color="text.secondary">
            Tu pedido ha sido confirmado y pagado
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Recibirás un email de confirmación con los detalles de tu pedido.
            El taller comenzará a preparar tu compra.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/my-orders')}
            >
              Ver Mis Pedidos
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/catalog')}
            >
              Seguir Comprando
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}
