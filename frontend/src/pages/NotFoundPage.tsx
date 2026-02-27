import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Seo } from '../shared/components/Seo'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <>
      <Seo
        title="Página no encontrada | RodaMallorca"
        description="La página que buscas no existe o ha sido movida. Vuelve al inicio o explora nuestro catálogo de bicicletas y talleres en Mallorca."
        robots="noindex,nofollow"
      />
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', py: { xs: 8, md: 14 } }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '7rem', md: '12rem' },
              fontWeight: 900,
              lineHeight: 1,
              color: 'primary.main',
              mb: 2,
            }}
          >
            404
          </Typography>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Página no encontrada
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
            La página que buscas no existe o ha sido movida.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" onClick={() => navigate('/')}>
              Ir al inicio
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/productos')}>
              Ver productos
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/talleres')}>
              Ver talleres
            </Button>
          </Stack>
        </Box>
      </Container>
    </>
  )
}
