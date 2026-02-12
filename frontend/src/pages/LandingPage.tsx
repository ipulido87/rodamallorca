import {
  Build,
  CheckCircle,
  Search,
  Security,
  TrendingUp,
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
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '../shared/components/HeroSection'
import { ScrollReveal, staggerItemVariants } from '../shared/components/ScrollReveal'
import { Seo } from '../shared/components/Seo'
import { landingStructuredData } from '../shared/constants/seo-structured-data'

const MotionBox = motion.create(Box)
const MotionCard = motion.create(Card)
const MotionButton = motion.create(Button)

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

  const [statsRef, statsInView] = useInView(0.3)

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

  return (
    <>
      <Seo
        title="RodaMallorca | Marketplace de bicicletas y talleres en Mallorca"
        description="Alquila bicicletas, encuentra talleres verificados y compra productos ciclistas en Mallorca con RodaMallorca."
        canonicalPath="/"
        keywords="marketplace bicicletas Mallorca, alquiler bicicletas, talleres ciclismo, tienda ciclismo Mallorca"
        structuredData={landingStructuredData}
      />

      <Box sx={{ position: 'relative', minHeight: '100vh', background: '#0a1628' }}>
      {/* Hero Section with Framer Motion */}
      <HeroSection />

      {/* Rest of page - dark themed sections */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Estadísticas */}
        <Box
          ref={statsRef}
          sx={{
            py: { xs: 8, md: 12 },
            background: 'linear-gradient(180deg, rgba(10, 22, 40, 0.95) 0%, #0d1b2a 100%)',
          }}
        >
          <Container maxWidth="lg">
            <ScrollReveal>
              <Typography
                variant="h3"
                textAlign="center"
                sx={{
                  fontWeight: 700,
                  mb: 6,
                  color: 'white',
                }}
              >
                Números que hablan por nosotros
              </Typography>
            </ScrollReveal>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
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
                  <MotionBox
                    key={index}
                    variants={staggerItemVariants}
                    sx={{ flex: 1, textAlign: 'center' }}
                  >
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
                        color: alpha('#ffffff', 0.7),
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </MotionBox>
                ))}
              </Stack>
            </motion.div>
          </Container>
        </Box>

        {/* Features Principales */}
        <Box sx={{ py: { xs: 8, md: 12 }, background: '#0d1b2a' }}>
          <Container maxWidth="lg">
            <ScrollReveal>
              <Typography
                variant="h3"
                textAlign="center"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: 'white',
                }}
              >
                Todo lo que necesitas en un solo lugar
              </Typography>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <Typography
                variant="h6"
                textAlign="center"
                sx={{
                  color: alpha('#ffffff', 0.7),
                  mb: 8,
                  fontWeight: 300,
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                Conectamos ciclistas con los mejores talleres y productos de Mallorca
              </Typography>
            </ScrollReveal>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {mainFeatures.map((feature, index) => (
                  <MotionBox key={index} variants={staggerItemVariants} sx={{ flex: 1 }}>
                    <MotionCard
                      whileHover={{ y: -10, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      sx={{
                        height: '100%',
                        background: feature.gradient,
                        color: theme.palette.common.white,
                        borderRadius: 4,
                        p: 4,
                        cursor: 'pointer',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                      }}
                    >
                      <CardContent sx={{ p: 0, textAlign: 'center' }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 3,
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.common.white, 0.2),
                            mb: 3,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, mb: 2 }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ opacity: 0.9, lineHeight: 1.6 }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </MotionCard>
                  </MotionBox>
                ))}
              </Stack>
            </motion.div>

            {/* Sección de Alquiler de Bicicletas */}
            <ScrollReveal variant="scale-up" delay={0.2}>
              <Box sx={{ mt: 12 }}>
                <MotionCard
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    color: theme.palette.common.white,
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: `0 10px 40px ${alpha(theme.palette.success.main, 0.3)}`,
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

                        <MotionButton
                          variant="contained"
                          size="large"
                          onClick={() => navigate('/rentals')}
                          startIcon={<CalendarMonth />}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          sx={{
                            backgroundColor: theme.palette.common.white,
                            color: theme.palette.success.main,
                            px: 5,
                            py: 2,
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            borderRadius: 3,
                            boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.2)}`,
                            textTransform: 'none',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.common.white, 0.95),
                            },
                          }}
                        >
                          Ver Bicicletas Disponibles
                        </MotionButton>
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <MotionBox
                          animate={{ y: [0, -20, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <PedalBike
                            sx={{
                              fontSize: { xs: 120, md: 200 },
                              opacity: 0.9,
                              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))',
                            }}
                          />
                        </MotionBox>
                      </Box>
                    </Stack>
                  </CardContent>
                </MotionCard>
              </Box>
            </ScrollReveal>
          </Container>
        </Box>

        {/* Pricing Section */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            background: 'linear-gradient(180deg, #0d1b2a 0%, #0a1628 100%)',
          }}
        >
          <Container maxWidth="lg">
            <ScrollReveal>
              <Stack spacing={2} alignItems="center" sx={{ mb: 8, textAlign: 'center' }}>
                <Chip
                  label="PRECIO ESPECIAL DE LANZAMIENTO"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    px: 3,
                    py: 2.5,
                    backgroundColor: alpha('#ffffff', 0.15),
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                  }}
                />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    color: 'white',
                  }}
                >
                  Plan Perfecto para tu Taller
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: alpha('#ffffff', 0.7),
                    fontWeight: 300,
                    maxWidth: 600,
                  }}
                >
                  Gestiona tu negocio, vende más y conecta con miles de ciclistas en Mallorca
                </Typography>
              </Stack>
            </ScrollReveal>

            <ScrollReveal variant="scale-up" delay={0.15}>
              <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                <MotionCard
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: `0 20px 80px ${alpha(theme.palette.common.black, 0.3)}`,
                    border: `2px solid ${theme.palette.primary.main}`,
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
                        label="7 DÍAS DE PRUEBA GRATIS"
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

                    <MotionButton
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => navigate('/register?type=owner')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 2,
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                      }}
                    >
                      Empezar Prueba Gratis - 7 Días
                    </MotionButton>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', textAlign: 'center', mt: 2 }}
                    >
                      7 días gratis, luego 18.30€/mes · Tarjeta requerida, sin cargos durante el trial
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Box>
            </ScrollReveal>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: { xs: 6, md: 8 },
            background: '#0a1628',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <ScrollReveal>
              <MotionBox
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <TrendingUp sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              </MotionBox>

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

              <MotionButton
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.97 }}
                sx={{
                  backgroundColor: theme.palette.common.white,
                  color: theme.palette.primary.main,
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.95),
                  },
                }}
              >
                Comenzar Ahora
              </MotionButton>
            </ScrollReveal>
          </Container>
        </Box>
      </Box>
      </Box>
    </>
  )
}
