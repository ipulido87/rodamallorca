import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
  alpha,
} from '@mui/material'
import {
  TwoWheeler,
  ShoppingBag,
  Receipt,
  Dashboard as DashboardIcon,
  Storefront,
  DirectionsBike,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { MediterraneanBackground } from '../shared/components/MediterraneanBackground'

export const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const isWorkshopOwner = user?.role === 'WORKSHOP_OWNER'

  // Cards for customers (USER)
  const customerActions = [
    {
      icon: <DirectionsBike sx={{ fontSize: 48 }} />,
      title: 'Explorar Bicicletas',
      description: 'Encuentra la bicicleta perfecta para alquilar',
      action: () => navigate('/alquileres'),
      gradient: 'linear-gradient(135deg, #0288d1 0%, #26c6da 100%)',
    },
    {
      icon: <TwoWheeler sx={{ fontSize: 48 }} />,
      title: 'Mis Alquileres',
      description: 'Ver y gestionar tus alquileres de bicicletas',
      action: () => navigate('/customer-rentals'),
      gradient: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
    },
    {
      icon: <Receipt sx={{ fontSize: 48 }} />,
      title: 'Mis Pedidos',
      description: 'Historial de compras y reparaciones',
      action: () => navigate('/my-orders'),
      gradient: 'linear-gradient(135deg, #00796b 0%, #4db6ac 100%)',
    },
    {
      icon: <ShoppingBag sx={{ fontSize: 48 }} />,
      title: 'Productos',
      description: 'Compra recambios y accesorios',
      action: () => navigate('/productos'),
      gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
    },
  ]

  // Cards for workshop owners (WORKSHOP_OWNER)
  const ownerActions = [
    {
      icon: <DashboardIcon sx={{ fontSize: 48 }} />,
      title: 'Dashboard',
      description: 'Resumen de tu negocio',
      action: () => navigate('/dashboard'),
      gradient: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
    },
    {
      icon: <Storefront sx={{ fontSize: 48 }} />,
      title: 'Mis Talleres',
      description: 'Gestiona tus talleres',
      action: () => navigate('/my-workshops'),
      gradient: 'linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)',
    },
    {
      icon: <DirectionsBike sx={{ fontSize: 48 }} />,
      title: 'Mis Productos',
      description: 'Administra tu inventario',
      action: () => navigate('/my-products'),
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
    },
    {
      icon: <TwoWheeler sx={{ fontSize: 48 }} />,
      title: 'Bicicletas de Alquiler',
      description: 'Gestiona bicicletas para alquilar',
      action: () => navigate('/my-rentals'),
      gradient: 'linear-gradient(135deg, #d84315 0%, #ff8a65 100%)',
    },
  ]

  const actions = isWorkshopOwner ? ownerActions : customerActions

  return (
    <>
      <MediterraneanBackground />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ py: 6 }}>
          {/* Header with glassmorphism effect */}
          <Box
            sx={{
              mb: 6,
              textAlign: 'center',
              p: 4,
              borderRadius: 4,
              background: alpha('#ffffff', 0.15),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha('#ffffff', 0.2),
            }}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                color: '#fff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Hola, {user?.name || user?.email?.split('@')[0] || 'Usuario'}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: alpha('#ffffff', 0.9),
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              {isWorkshopOwner
                ? 'Gestiona tu negocio desde aquí'
                : 'Descubre la Ruta 312 y explora Mallorca en bicicleta'}
            </Typography>
          </Box>

          {/* Action Cards with glassmorphism */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {actions.map((action, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: alpha('#ffffff', 0.9),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#ffffff', 0.3),
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: action.gradient,
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    '& .card-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                  },
                }}
                onClick={action.action}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Box
                      className="card-icon"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: action.gradient,
                        color: '#fff',
                        transition: 'transform 0.3s ease',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        mt: 1,
                        background: action.gradient,
                        '&:hover': {
                          background: action.gradient,
                          filter: 'brightness(1.1)',
                        },
                      }}
                    >
                      Explorar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Route 312 Info Section */}
          <Box sx={{ mt: 6 }}>
            <Card
              sx={{
                background: alpha('#1a237e', 0.85),
                backdropFilter: 'blur(10px)',
                color: '#fff',
                p: 4,
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '40%',
                  height: '100%',
                  background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath d=\'M20,80 Q40,60 60,70 T100,50\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'2\'/%3E%3Cpath d=\'M0,90 Q30,70 50,80 T100,60\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'2\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                },
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: alpha('#ffffff', 0.7), letterSpacing: 2 }}
                  >
                    Descubre Mallorca
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {isWorkshopOwner ? '¿Necesitas ayuda con tu taller?' : 'La Ruta 312'}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: alpha('#ffffff', 0.9) }}>
                    {isWorkshopOwner
                      ? 'Estamos aquí para ayudarte a crecer tu negocio y conectar con ciclistas de todo el mundo.'
                      : '312 km de carreteras épicas por la Serra de Tramuntana. La misma ruta que usan los profesionales del Tour de Francia para entrenar.'}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(isWorkshopOwner ? '/contacto' : '/#rutas')}
                    sx={{
                      background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
                      },
                    }}
                  >
                    {isWorkshopOwner ? 'Contactar Soporte' : 'Explorar Rutas'}
                  </Button>
                </Box>
                <Box
                  sx={{
                    width: { xs: '100%', md: 200 },
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DirectionsBike sx={{ fontSize: 120, color: alpha('#ffffff', 0.2) }} />
                </Box>
              </Stack>
            </Card>
          </Box>
        </Box>
      </Container>
    </>
  )
}
