import { CheckCircle } from '@mui/icons-material'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export const SubscriptionSuccess = () => {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <CheckCircle
            sx={{
              fontSize: 120,
              color: 'success.main',
            }}
          />

          <Typography variant="h3" fontWeight="bold">
            ¡Suscripción Activada!
          </Typography>

          <Typography variant="h6" color="text.secondary">
            Tu suscripción está activa y lista para usar
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
            Ya puedes disfrutar de todas las funcionalidades premium de RodaMallorca.
            Empezamos tu período de prueba de 7 días gratis.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              Ir al Dashboard
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/my-workshops')}
            >
              Ver Mis Talleres
            </Button>
          </Stack>

          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              📧 Recibirás un email con los detalles de tu suscripción
              <br />
              💳 El primer cobro será después de los 7 días de prueba
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Container>
  )
}
