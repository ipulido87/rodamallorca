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
import { useTranslation } from 'react-i18next'
import { useAuth } from '../features/auth/hooks/useAuth'
import { MediterraneanBackground } from '../shared/components/MediterraneanBackground'

export const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const isWorkshopOwner = user?.role === 'WORKSHOP_OWNER'

  // Cards for customers (USER)
  const customerActions = [
    {
      icon: <DirectionsBike sx={{ fontSize: 48 }} />,
      title: t('home.exploreBikes'),
      description: t('home.exploreBikesDesc'),
      action: () => navigate('/alquileres'),
      gradient: 'linear-gradient(135deg, #0288d1 0%, #26c6da 100%)',
    },
    {
      icon: <TwoWheeler sx={{ fontSize: 48 }} />,
      title: t('home.myRentals'),
      description: t('home.myRentalsDesc'),
      action: () => navigate('/customer-rentals'),
      gradient: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
    },
    {
      icon: <Receipt sx={{ fontSize: 48 }} />,
      title: t('home.myOrders'),
      description: t('home.myOrdersDesc'),
      action: () => navigate('/my-orders'),
      gradient: 'linear-gradient(135deg, #00796b 0%, #4db6ac 100%)',
    },
    {
      icon: <ShoppingBag sx={{ fontSize: 48 }} />,
      title: t('home.products'),
      description: t('home.productsDesc'),
      action: () => navigate('/productos'),
      gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
    },
  ]

  // Cards for workshop owners (WORKSHOP_OWNER)
  const ownerActions = [
    {
      icon: <DashboardIcon sx={{ fontSize: 48 }} />,
      title: t('home.dashboard'),
      description: t('home.dashboardDesc'),
      action: () => navigate('/dashboard'),
      gradient: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
    },
    {
      icon: <Storefront sx={{ fontSize: 48 }} />,
      title: t('home.myWorkshops'),
      description: t('home.myWorkshopsDesc'),
      action: () => navigate('/my-workshops'),
      gradient: 'linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)',
    },
    {
      icon: <DirectionsBike sx={{ fontSize: 48 }} />,
      title: t('home.myProducts'),
      description: t('home.myProductsDesc'),
      action: () => navigate('/my-products'),
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
    },
    {
      icon: <TwoWheeler sx={{ fontSize: 48 }} />,
      title: t('home.rentalBikes'),
      description: t('home.rentalBikesDesc'),
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
              {t('home.hello', { name: user?.name || user?.email?.split('@')[0] || 'Usuario' })}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: alpha('#ffffff', 0.9),
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              {isWorkshopOwner
                ? t('home.manageBusinessFromHere')
                : t('home.discoverRoute312')}
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
                      {t('common.explore')}
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
                    {t('home.discoverMallorca')}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {isWorkshopOwner ? t('home.needHelpWorkshop') : t('home.route312')}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: alpha('#ffffff', 0.9) }}>
                    {isWorkshopOwner
                      ? t('home.needHelpWorkshopDesc')
                      : t('home.route312Desc')}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(isWorkshopOwner ? '/contacto' : '/rutas')}
                    sx={{
                      background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
                      },
                    }}
                  >
                    {isWorkshopOwner ? t('home.contactSupport') : t('home.exploreRoutes')}
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
