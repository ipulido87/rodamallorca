import {
  Build,
  CheckCircle,
  LocationOn,
  Search,
  Security,
  Speed,
  Star,
  TrendingUp,
  Verified,
  PedalBike,
  CalendarMonth,
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedBackground } from '../shared/components/AnimatedBackground'

// Hook optimizado para intersection observer
const useInView = (threshold = 0.1) => {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold, rootMargin: '50px' }
    )

    const current = ref.current
    if (current) observer.observe(current)

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [threshold])

  return [ref, inView] as const
}

// Contador animado mejorado
const AnimatedCounter = ({
  end,
  duration = 2000,
  suffix = '',
}: {
  end: number
  duration?: number
  suffix?: string
}) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing cuadrático
      const easeOut = 1 - Math.pow(1 - progress, 2)
      setCount(Math.floor(easeOut * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

export const LandingPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [mounted, setMounted] = useState(false)

  const [heroRef, heroInView] = useInView(0.1)
  const [statsRef, statsInView] = useInView(0.3)
  const [featuresRef, featuresInView] = useInView(0.2)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mainFeatures = [
    {
      icon: <Search sx={{ fontSize: 40 }} />,
      title: 'Búsqueda Avanzada',
      description: 'Filtros inteligentes para encontrar tu bicicleta ideal',
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    },
    {
      icon: <Build sx={{ fontSize: 40 }} />,
      title: 'Talleres Verificados',
      description: 'Red de profesionales certificados en toda Mallorca',
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Compra Segura',
      description: 'Transacciones protegidas con garantía total',
      gradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
    },
  ]

  const benefits = [
    {
      icon: <Speed />,
      title: 'Rápido y Eficiente',
      desc: 'Encuentra lo que buscas en minutos',
    },
    {
      icon: <LocationOn />,
      title: 'Cobertura Total',
      desc: 'Toda Mallorca en una sola plataforma',
    },
    {
      icon: <Verified />,
      title: 'Calidad Premium',
      desc: 'Solo los mejores productos y servicios',
    },
    {
      icon: <Star />,
      title: 'Soporte 24/7',
      desc: 'Atención personalizada cuando la necesites',
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          color: theme.palette.primary.contrastText,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="lg" sx={{ zIndex: 1 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={6}
            alignItems="center"
          >
            <Box sx={{ flex: { md: 3 } }}>
              <Fade in={mounted && heroInView} timeout={1500}>
                <Box>
                  <Chip
                    label="Plataforma #1 en Mallorca"
                    sx={{
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                      color: theme.palette.common.white,
                      mb: 3,
                      px: 2,
                      py: 1,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  />

                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                      mb: 3,
                      lineHeight: 1.1,
                      background: `linear-gradient(45deg, ${
                        theme.palette.common.white
                      } 30%, ${alpha(theme.palette.common.white, 0.8)} 90%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Roda
                    <span style={{ color: theme.palette.secondary.light }}>
                      Mallorca
                    </span>
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      opacity: 0.95,
                      mb: 4,
                      fontWeight: 300,
                      lineHeight: 1.4,
                    }}
                  >
                    El marketplace más completo de bicicletas y servicios
                    ciclistas en Mallorca
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/catalog')}
                      startIcon={<Search />}
                      sx={{
                        backgroundColor: theme.palette.common.white,
                        color: theme.palette.primary.main,
                        px: 4,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        boxShadow: `0 10px 40px ${alpha(
                          theme.palette.common.black,
                          0.15
                        )}`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.common.white,
                            0.95
                          ),
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: `0 20px 60px ${alpha(
                            theme.palette.common.black,
                            0.2
                          )}`,
                        },
                      }}
                    >
                      Explorar Catálogo
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/register?type=owner')}
                      startIcon={<Build />}
                      sx={{
                        borderColor: theme.palette.common.white,
                        color: theme.palette.common.white,
                        px: 4,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        borderWidth: 2,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.common.white,
                            0.15
                          ),
                          borderColor: theme.palette.common.white,
                          transform: 'translateY(-4px)',
                          boxShadow: `0 10px 30px ${alpha(
                            theme.palette.common.black,
                            0.2
                          )}`,
                        },
                      }}
                    >
                      Únete como Taller
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Box>

          </Stack>
        </Container>
      </Box>

      {/* Estadísticas */}
      <Box
        ref={statsRef}
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(180deg, ${alpha(
            theme.palette.primary.main,
            0.03
          )} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              fontWeight: 700,
              mb: 6,
              color: theme.palette.text.primary,
            }}
          >
            Números que hablan por nosotros
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={4}
            justifyContent="center"
          >
            {[
              {
                number: 350,
                suffix: '+',
                label: 'Bicicletas Disponibles',
                color: theme.palette.primary.main,
              },
              {
                number: 60,
                suffix: '+',
                label: 'Talleres Verificados',
                color: theme.palette.secondary.main,
              },
              {
                number: 98,
                suffix: '%',
                label: 'Satisfacción Cliente',
                color: theme.palette.success.main,
              },
              {
                number: 1200,
                suffix: '+',
                label: 'Ventas Realizadas',
                color: theme.palette.info.main,
              },
            ].map((stat, index) => (
              <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                <Fade in={statsInView} timeout={1200 + index * 200}>
                  <Box>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                        color: stat.color,
                        mb: 1,
                      }}
                    >
                      {statsInView ? (
                        <AnimatedCounter
                          end={stat.number}
                          suffix={stat.suffix}
                        />
                      ) : (
                        0
                      )}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Fade>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Features Principales */}
      <Box ref={featuresRef} sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            Todo lo que necesitas en un solo lugar
          </Typography>

          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              color: theme.palette.text.secondary,
              mb: 8,
              fontWeight: 300,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Conectamos ciclistas con los mejores talleres y productos de
            Mallorca
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            {mainFeatures.map((feature, index) => (
              <Box key={index} sx={{ flex: 1 }}>
                <Fade in={featuresInView} timeout={1000 + index * 300}>
                  <Card
                    sx={{
                      height: '100%',
                      background: feature.gradient,
                      color: theme.palette.common.white,
                      borderRadius: 4,
                      p: 4,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 60px ${alpha(
                          theme.palette.common.black,
                          0.15
                        )}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 0, textAlign: 'center' }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          p: 3,
                          borderRadius: 3,
                          backgroundColor: alpha(
                            theme.palette.common.white,
                            0.2
                          ),
                          mb: 3,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Box>
            ))}
          </Stack>

          {/* Sección de Alquiler de Bicicletas */}
          <Box sx={{ mt: 12 }}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: theme.palette.common.white,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 60px ${alpha(theme.palette.success.main, 0.4)}`,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={4}
                  alignItems="center"
                >
                  <Box sx={{ flex: 1 }}>
                    <Chip
                      icon={<PedalBike />}
                      label="NUEVO"
                      sx={{
                        backgroundColor: alpha(theme.palette.common.white, 0.25),
                        color: theme.palette.common.white,
                        fontWeight: 700,
                        mb: 3,
                      }}
                    />
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        mb: 3,
                        fontSize: { xs: '2rem', md: '3rem' },
                      }}
                    >
                      Alquiler de Bicicletas
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 4,
                        opacity: 0.95,
                        fontWeight: 300,
                        lineHeight: 1.6,
                      }}
                    >
                      Descubre Mallorca en bicicleta. Alquila las mejores bicis de talleres verificados con precios desde 15€/día.
                    </Typography>

                    <Stack spacing={2} sx={{ mb: 4 }}>
                      {[
                        'Carretera, Montaña, Eléctricas y más',
                        'Seguro y casco incluidos',
                        'Recogida en tu ubicación',
                        'Cancelación flexible',
                      ].map((item, index) => (
                        <Box
                          key={index}
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <CheckCircle sx={{ fontSize: 24 }} />
                          <Typography variant="body1" fontWeight={500}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/rentals')}
                      startIcon={<CalendarMonth />}
                      sx={{
                        backgroundColor: theme.palette.common.white,
                        color: theme.palette.success.main,
                        px: 5,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.2)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.common.white, 0.95),
                          transform: 'scale(1.05)',
                          boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.25)}`,
                        },
                      }}
                    >
                      Ver Bicicletas Disponibles
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <PedalBike
                      sx={{
                        fontSize: { xs: 120, md: 200 },
                        opacity: 0.9,
                        filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))',
                        animation: 'float 3s ease-in-out infinite',
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-20px)' },
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(
            theme.palette.primary.main,
            0.03
          )} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" sx={{ mb: 8, textAlign: 'center' }}>
            <Chip
              label="💎 PRECIO ESPECIAL DE LANZAMIENTO"
              color="primary"
              sx={{
                fontSize: '0.9rem',
                fontWeight: 700,
                px: 3,
                py: 2.5,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                color: theme.palette.text.primary,
              }}
            >
              Plan Perfecto para tu Taller
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 300,
                maxWidth: 600,
              }}
            >
              Gestiona tu negocio, vende más y conecta con miles de ciclistas en Mallorca
            </Typography>
          </Stack>

          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: `0 20px 80px ${alpha(theme.palette.common.black, 0.12)}`,
                border: `2px solid ${theme.palette.primary.main}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 30px 100px ${alpha(theme.palette.common.black, 0.18)}`,
                },
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: theme.palette.common.white,
                  py: 3,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h5" fontWeight="700" gutterBottom>
                  Taller Pro
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Todo lo que necesitas para crecer
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        color: theme.palette.primary.main,
                        fontSize: '3.5rem',
                      }}
                    >
                      18.30€
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 300,
                      }}
                    >
                      /mes
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    IVA incluido · Sin compromiso · Cancela cuando quieras
                  </Typography>
                  <Chip
                    label="🎁 7 DÍAS DE PRUEBA GRATIS"
                    color="success"
                    sx={{
                      mt: 1,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      px: 2,
                    }}
                  />
                </Stack>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  {[
                    'Dashboard completo de ventas',
                    'Gestión ilimitada de productos',
                    'Sistema de pedidos integrado',
                    'Facturación automática con PDF',
                    'Catálogo visible para miles de usuarios',
                    'Estadísticas de rendimiento',
                    'Notificaciones en tiempo real',
                    'Soporte técnico prioritario',
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                    >
                      <CheckCircle
                        sx={{
                          color: theme.palette.success.main,
                          fontSize: 24,
                        }}
                      />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => navigate('/register?type=owner')}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  }}
                >
                  Empezar Prueba Gratis - 7 Días
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', mt: 2 }}
                >
                  7 días gratis, luego 18.30€/mes · Tarjeta requerida, sin cargos durante el trial
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: theme.palette.primary.contrastText,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <TrendingUp sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Únete a la revolución ciclista
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontWeight: 300,
            }}
          >
            Más de 1000 ciclistas ya confían en nosotros
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              backgroundColor: theme.palette.common.white,
              color: theme.palette.primary.main,
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 600,
              borderRadius: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.95),
                transform: 'scale(1.05)',
              },
            }}
          >
            Comenzar Ahora
          </Button>
        </Container>
      </Box>
    </Box>
  )
}
