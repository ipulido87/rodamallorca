import { Cancel } from '@mui/icons-material'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export const CheckoutCancel = () => {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <Cancel sx={{ fontSize: 120, color: 'warning.main' }} />

          <Typography variant="h3" fontWeight="bold">
            Pago Cancelado
          </Typography>

          <Typography variant="h6" color="text.secondary">
            No se realizó ningún cargo
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Puedes volver a tu carrito para completar el pago cuando estés listo.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/cart')}
            >
              Volver al Carrito
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
