import {
  Check,
  DirectionsBike,
  Inventory,
  Receipt,
  TrendingUp,
  Email,
} from '@mui/icons-material'
import { Seo } from '../../../shared/components/Seo'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import useSWR from 'swr'
import { getMyWorkshops } from '../../workshops/services/workshop-service'
import { redirectToCheckout } from '../services/subscription-service'
import { useState, useEffect } from 'react'

export const PricingPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)

  // Obtener talleres del usuario
  const { data: workshops } = useSWR(
    user ? '/owner/workshops' : null,
    getMyWorkshops
  )

  // ⭐ Auto-iniciar checkout si viene de Google OAuth
  useEffect(() => {
    const auto = searchParams.get('auto')
    if (auto === 'true' && user && workshops && workshops.length > 0 && !loading) {
      console.log('🚀 [Pricing] Auto-iniciando checkout para nuevo taller owner...')
      handleSubscribe()
    }
  }, [searchParams, user, workshops])

  const handleSubscribe = async () => {
    if (!user) {
      // ⭐ No loggeado → Registro como TALLER (no login normal)
      navigate('/register?type=owner')
      return
    }

    if (!workshops || workshops.length === 0) {
      navigate('/create-workshop')
      return
    }

    try {
      setLoading(true)
      await redirectToCheckout(workshops[0].id)
    } catch (error) {
      console.error('Error iniciando checkout:', error)
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <Inventory />,
      text: 'Publicar productos ilimitados',
      highlighted: true,
    },
    {
      icon: <DirectionsBike />,
      text: 'Gestión completa de servicios',
      highlighted: true,
    },
    {
      icon: <Receipt />,
      text: 'Facturación electrónica automática',
      highlighted: false,
    },
    {
      icon: <TrendingUp />,
      text: 'Estadísticas de ventas en tiempo real',
      highlighted: false,
    },
    {
      icon: <Email />,
      text: 'Notificaciones automáticas por email',
      highlighted: false,
    },
    {
      icon: <Check />,
      text: 'Soporte técnico prioritario',
      highlighted: false,
    },
  ]

  return (
    <Container maxWidth="lg">
      <Seo
        title="Planes y Precios para Talleres | RodaMallorca"
        description="Digitaliza tu taller de bicicletas en Mallorca. Publica productos ilimitados, gestiona alquileres y recibe pagos online. Prueba gratuita 7 días, luego 18,30€/mes."
        keywords="precios taller bicicletas Mallorca, marketplace talleres ciclismo, software gestión taller bicicletas, vender bicicletas online Mallorca"
        canonicalPath="/pricing"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'RodaMallorca Plan Taller',
          description: 'Plan de suscripción mensual para talleres de bicicletas en Mallorca. Incluye publicación de productos, gestión de alquileres, facturación y pagos online.',
          offers: {
            '@type': 'Offer',
            price: '18.30',
            priceCurrency: 'EUR',
            priceValidUntil: '2026-12-31',
            availability: 'https://schema.org/InStock',
            url: 'https://rodamallorca.es/pricing',
          },
        }}
      />
      <Box sx={{ py: 8 }}>
        {/* Header */}
        <Stack spacing={2} alignItems="center" sx={{ mb: 8 }}>
          <Chip
            label="💎 PRECIO ESPECIAL DE LANZAMIENTO"
            color="primary"
            sx={{ fontWeight: 600 }}
          />

          <Typography
            variant="h2"
            fontWeight="bold"
            textAlign="center"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Plan Perfecto para tu Taller
          </Typography>

          <Typography variant="h5" textAlign="center" color="text.secondary">
            Todo lo que necesitas para gestionar tu negocio de bicicletas
          </Typography>
        </Stack>

        {/* Pricing Card */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Card
            sx={{
              maxWidth: 500,
              width: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'visible',
              boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.3)}`,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          >
            {/* Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: theme.palette.success.main,
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow: 3,
              }}
            >
              🎁 7 DÍAS GRATIS
            </Box>

            <CardContent sx={{ p: 4, pt: 5 }}>
              {/* Precio */}
              <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Taller Pro
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h2" fontWeight="bold" color="primary">
                    18.30€
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                    /mes
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  IVA incluido · Sin compromiso · Cancela cuando quieras
                </Typography>
              </Stack>

              {/* Features List */}
              <List sx={{ mb: 3 }}>
                {features.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: feature.highlighted
                            ? theme.palette.primary.main
                            : alpha(theme.palette.primary.main, 0.1),
                          color: feature.highlighted
                            ? 'white'
                            : theme.palette.primary.main,
                        }}
                      >
                        {feature.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.text}
                      primaryTypographyProps={{
                        fontWeight: feature.highlighted ? 600 : 400,
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              {/* CTA Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubscribe}
                disabled={loading}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Redirigiendo...' : 'Empezar Prueba Gratis - 7 Días'}
              </Button>

              <Typography
                variant="caption"
                display="block"
                textAlign="center"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                ✓ 7 días gratis, luego 18.30€/mes
                <br />
                ✓ Tarjeta requerida, sin cargos durante el trial
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Trust Section */}
        <Stack spacing={3} alignItems="center" sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight="600">
            ¿Por qué RodaMallorca?
          </Typography>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            justifyContent="center"
          >
            {[
              { emoji: '🚀', title: 'Fácil de usar', desc: 'Configura tu taller en minutos' },
              { emoji: '🔒', title: 'Seguro', desc: 'Tus datos protegidos con SSL' },
              { emoji: '💰', title: 'Sin sorpresas', desc: 'Precio fijo mensual' },
              { emoji: '🎯', title: 'Cancela cuando quieras', desc: 'Sin penalizaciones' },
            ].map((item, index) => (
              <Card
                key={index}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Typography variant="h2" sx={{ mb: 1 }}>
                  {item.emoji}
                </Typography>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.desc}
                </Typography>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}
