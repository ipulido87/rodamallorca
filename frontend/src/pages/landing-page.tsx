import { Build, DirectionsBike, Person, Speed } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

export const LandingPage = () => {
  const navigate = useNavigate()

  const stats = [
    { number: '500+', label: 'Bicicletas' },
    { number: '50+', label: 'Talleres' },
    { number: '1000+', label: 'Ciclistas' },
    { number: '100+', label: 'Rutas' },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 40%, ${theme.palette.info.light} 100%)`,
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ pt: 10, pb: 8, textAlign: 'center', color: 'white' }}>
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 3,
            }}
          >
            🚴‍♂️ RodaMallorca
          </Typography>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.4,
            }}
          >
            Tu marketplace de bicicletas en la isla más bella del Mediterráneo
          </Typography>

          {/* Chips informativos */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            <Chip
              icon={<DirectionsBike />}
              label="Venta & Alquiler"
              size="medium"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontSize: '1rem',
                py: 2,
                px: 1,
                height: 48,
              }}
            />
            <Chip
              icon={<Build />}
              label="Reparaciones"
              size="medium"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontSize: '1rem',
                py: 2,
                px: 1,
                height: 48,
              }}
            />
            <Chip
              icon={<Speed />}
              label="Rutas Guiadas"
              size="medium"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontSize: '1rem',
                py: 2,
                px: 1,
                height: 48,
              }}
            />
          </Stack>
        </Box>

        {/* Cards de registro */}
        <Box sx={{ pb: 8 }}>
          <Typography
            variant="h3"
            textAlign="center"
            gutterBottom
            sx={{
              color: 'white',
              mb: 6,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            ¿Cómo quieres rodar con nosotros?
          </Typography>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            justifyContent="center"
            sx={{ maxWidth: '900px', mx: 'auto' }}
          >
            {/* Cliente */}
            <Card
              elevation={8}
              sx={{
                flex: 1,
                maxWidth: { xs: '100%', md: '420px' },
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                },
              }}
              onClick={() => navigate('/register?type=user')}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 24px rgba(63, 81, 181, 0.3)',
                  }}
                >
                  <Person sx={{ fontSize: 45, color: 'white' }} />
                </Box>

                <Typography
                  variant="h4"
                  gutterBottom
                  color="primary"
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  Soy Ciclista
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}
                >
                  Encuentra la bici perfecta, alquila para tus rutas o repara tu
                  compañera de aventuras
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '1rem' }}
                  >
                    🔍 Explora cientos de bicicletas
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '1rem' }}
                  >
                    🏔️ Alquila para rutas en la Serra de Tramuntana
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '1rem' }}
                  >
                    🔧 Conecta con talleres especializados
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '1rem' }}
                  >
                    🏖️ Descubre rutas costeras únicas
                  </Typography>
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<DirectionsBike />}
                  sx={{
                    py: 2,
                    fontSize: '1.2rem',
                  }}
                >
                  Empezar a Rodar
                </Button>
              </CardContent>
            </Card>

            {/* Propietario de Taller */}
            <Card
              elevation={8}
              sx={{
                flex: 1,
                maxWidth: { xs: '100%', md: '420px' },
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                },
              }}
              onClick={() => navigate('/register?type=owner')}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 24px rgba(0, 150, 136, 0.3)',
                  }}
                >
                  <Build sx={{ fontSize: 45, color: 'white' }} />
                </Box>

                <Typography
                  variant="h4"
                  gutterBottom
                  color="success.dark"
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  Tengo un Taller
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}
                >
                  Haz crecer tu negocio, conecta con más ciclistas y sé parte de
                  la comunidad
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '1rem' }}
                  >
                    📦 Gestiona tu inventario online
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '1rem' }}
                  >
                    👥 Conecta con ciclistas de toda la isla
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '1rem' }}
                  >
                    💰 Aumenta tus ingresos
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '1rem' }}
                  >
                    🏆 Construye tu reputación
                  </Typography>
                </Stack>

                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  startIcon={<Build />}
                  sx={{
                    py: 2,
                    fontSize: '1.2rem',
                  }}
                >
                  Unirse como Taller
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Container>

      {/* Estadísticas */}
      <Box
        sx={{ py: 8, bgcolor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={{ xs: 2, md: 6 }}
            justifyContent="center"
            textAlign="center"
            flexWrap="wrap"
          >
            {stats.map((stat, index) => (
              <Box
                key={index}
                sx={{
                  flex: {
                    xs: '0 1 calc(50% - 8px)',
                    md: '0 1 calc(25% - 24px)',
                  },
                  minWidth: 120,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.8)', py: 6 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={3}
          >
            <Box textAlign={{ xs: 'center', md: 'left' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                ¿Ya tienes cuenta?
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Accede a tu cuenta para empezar a rodar
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                color: 'white',
                borderColor: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Iniciar Sesión
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
