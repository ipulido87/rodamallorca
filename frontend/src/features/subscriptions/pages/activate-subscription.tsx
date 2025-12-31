import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { Lock, Rocket, CreditCard } from '@mui/icons-material'
import { useAuth } from '../../auth/hooks/useAuth'

/**
 * Página que se muestra cuando un WORKSHOP_OWNER intenta acceder
 * a funcionalidades sin tener suscripción activa
 */
export const ActivateSubscription = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    // Si no es WORKSHOP_OWNER, redirigir a home
    if (user && user.role !== 'WORKSHOP_OWNER') {
      navigate('/home', { replace: true })
    }
  }, [user, navigate])

  const handleActivate = () => {
    navigate('/pricing')
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            borderRadius: 4,
            boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            {/* Icon */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 4,
              }}
            >
              <Lock
                sx={{
                  fontSize: 60,
                  color: theme.palette.primary.main,
                }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Activa tu Suscripción
            </Typography>

            {/* Description */}
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, fontWeight: 300 }}
            >
              Para acceder a todas las funcionalidades de tu taller, necesitas activar tu
              suscripción
            </Typography>

            {/* Features included */}
            <Stack spacing={2} sx={{ mb: 4, textAlign: 'left' }}>
              {[
                {
                  icon: <Rocket />,
                  title: '7 días de prueba gratis',
                  desc: 'Acceso completo sin cargos durante el trial',
                },
                {
                  icon: <CreditCard />,
                  title: 'Solo 14.90€/mes después',
                  desc: 'Cancela cuando quieras, sin compromiso',
                },
              ].map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            {/* CTA */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleActivate}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Empezar Prueba Gratis - 7 Días
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 2 }}
            >
              ✓ Sin cargos durante el trial · ✓ Cancela cuando quieras
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
