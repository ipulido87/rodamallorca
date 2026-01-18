import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Stack
} from '@mui/material'
import {
  TwoWheeler,
  ShoppingBag,
  Receipt,
  Dashboard as DashboardIcon,
  Storefront,
  DirectionsBike
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

export const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const isWorkshopOwner = user?.role === 'WORKSHOP_OWNER'

  // Cards para clientes (USER)
  const customerActions = [
    {
      icon: <DirectionsBike sx={{ fontSize: 48 }} />,
      title: 'Explorar Bicicletas',
      description: 'Encuentra la bicicleta perfecta para alquilar',
      action: () => navigate('/alquileres'),
      color: 'primary.main',
    },
    {
      icon: <TwoWheeler sx={{ fontSize: 48 }} />,
      title: 'Mis Alquileres',
      description: 'Ver y gestionar tus alquileres de bicicletas',
      action: () => navigate('/my-rentals'),
      color: 'info.main',
    },
    {
      icon: <Receipt sx={{ fontSize: 48 }} />,
      title: 'Mis Pedidos',
      description: 'Historial de compras y reparaciones',
      action: () => navigate('/my-orders'),
      color: 'secondary.main',
    },
    {
      icon: <ShoppingBag sx={{ fontSize: 48 }} />,
      title: 'Productos',
      description: 'Compra recambios y accesorios',
      action: () => navigate('/productos'),
      color: 'success.main',
    },
  ]

  // Cards para propietarios de taller (WORKSHOP_OWNER)
  const ownerActions = [
    {
      icon: <DashboardIcon sx={{ fontSize: 48 }} />,
      title: 'Dashboard',
      description: 'Resumen de tu negocio',
      action: () => navigate('/dashboard'),
      color: 'primary.main',
    },
    {
      icon: <Storefront sx={{ fontSize: 48 }} />,
      title: 'Mis Talleres',
      description: 'Gestiona tus talleres',
      action: () => navigate('/my-workshops'),
      color: 'info.main',
    },
    {
      icon: <DirectionsBike sx={{ fontSize: 48 }} />,
      title: 'Mis Productos',
      description: 'Administra tu inventario',
      action: () => navigate('/my-products'),
      color: 'secondary.main',
    },
    {
      icon: <TwoWheeler sx={{ fontSize: 48 }} />,
      title: 'Mis Bicicletas de Alquiler',
      description: 'Gestiona bicicletas para alquilar',
      action: () => navigate('/my-rentals'),
      color: 'success.main',
    },
  ]

  const actions = isWorkshopOwner ? ownerActions : customerActions

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Hola, {user?.name || user?.email?.split('@')[0] || 'Usuario'}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {isWorkshopOwner
              ? 'Gestiona tu negocio desde aquí'
              : 'Explora nuestras opciones de alquiler y compra'}
          </Typography>
        </Box>

        {/* Action Cards */}
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
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
              onClick={action.action}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      color: action.color,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                    Ir
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Additional Info Section */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {isWorkshopOwner
                ? '¿Necesitas ayuda con tu taller?'
                : '¿Necesitas ayuda?'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {isWorkshopOwner
                ? 'Estamos aquí para ayudarte a crecer tu negocio'
                : 'Contáctanos para cualquier consulta sobre alquileres o productos'}
            </Typography>
            <Button variant="contained" color="secondary" size="large">
              Contactar Soporte
            </Button>
          </Card>
        </Box>
      </Box>
    </Container>
  )
}
