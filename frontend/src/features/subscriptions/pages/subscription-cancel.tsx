import { Cancel } from '@mui/icons-material'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export const SubscriptionCancel = () => {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <Cancel
            sx={{
              fontSize: 120,
              color: 'warning.main',
            }}
          />

          <Typography variant="h3" fontWeight="bold">
            Proceso Cancelado
          </Typography>

          <Typography variant="h6" color="text.secondary">
            No te preocupes, puedes suscribirte cuando quieras
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
            Tu suscripción no se ha activado. Puedes volver a intentarlo cuando estés listo.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/pricing')}
            >
              Ver Planes
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              Volver al Dashboard
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}
