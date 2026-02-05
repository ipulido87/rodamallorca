import { DirectionsBike, Email, LocationOn, Phone } from '@mui/icons-material'
import { Box, Container, Divider, Stack, Typography } from '@mui/material'

export const PublicFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(20px)',
        color: 'white',
        mt: 'auto',
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="space-between"
        >
          {/* Logo y descripción */}
          <Box sx={{ flex: 1 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <DirectionsBike sx={{ fontSize: 32, color: 'primary.light' }} />
              <Typography variant="h5" fontWeight="bold">
                RodaMallorca
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 300 }}
            >
              Tu marketplace de bicicletas en Mallorca. Conectamos ciclistas con
              talleres locales para crear la mejor experiencia de ciclismo en la
              isla.
            </Typography>
          </Box>

          {/* Links rápidos */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Enlaces Rápidos
            </Typography>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'primary.light', cursor: 'pointer' },
                }}
              >
                Sobre Nosotros
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'primary.light', cursor: 'pointer' },
                }}
              >
                Cómo Funciona
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'primary.light', cursor: 'pointer' },
                }}
              >
                Rutas Recomendadas
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'primary.light', cursor: 'pointer' },
                }}
              >
                Centro de Ayuda
              </Typography>
            </Stack>
          </Box>

          {/* Contacto */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contacto
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOn sx={{ fontSize: 18, color: 'primary.light' }} />
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  Palma de Mallorca, España
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Email sx={{ fontSize: 18, color: 'primary.light' }} />
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  info@rodamallorca.com
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Phone sx={{ fontSize: 18, color: 'primary.light' }} />
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  +34 971 000 000
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            © 2024 RodaMallorca. Todos los derechos reservados.
          </Typography>

          <Stack direction="row" spacing={3}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.6)',
                '&:hover': { color: 'primary.light', cursor: 'pointer' },
              }}
            >
              Términos de Servicio
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.6)',
                '&:hover': { color: 'primary.light', cursor: 'pointer' },
              }}
            >
              Política de Privacidad
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
