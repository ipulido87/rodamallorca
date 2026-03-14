import { DirectionsBike, Email, LocationOn, ChatBubbleOutline } from '@mui/icons-material'
import { Box, Container, Divider, Link, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

export const PublicFooter = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: t('footer.aboutUs'), to: '/sobre-nosotros' },
    { label: t('footer.howItWorks'), to: '/como-funciona' },
    { label: t('footer.recommendedRoutes'), to: '/rutas-recomendadas' },
    { label: t('footer.helpCenter'), to: '/centro-de-ayuda' },
  ]

  const legalLinks = [
    { label: t('footer.termsOfService'), to: '/terminos-de-servicio' },
    { label: t('footer.privacyPolicy'), to: '/politica-de-privacidad' },
  ]

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
              {t('footer.description')}
            </Typography>
          </Box>

          {/* Links rápidos */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              {t('footer.quickLinks')}
            </Typography>
            <Stack spacing={1}>
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  underline="none"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    '&:hover': { color: 'primary.light' },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Contacto */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              {t('footer.contact')}
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOn sx={{ fontSize: 18, color: 'primary.light' }} />
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  {t('footer.location')}
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
                <ChatBubbleOutline sx={{ fontSize: 18, color: 'primary.light' }} />
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  {t('footer.contactViaEmail')}
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
            © {currentYear} RodaMallorca. {t('footer.rights')}
          </Typography>

          <Stack direction="row" spacing={3}>
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                component={RouterLink}
                to={link.to}
                underline="none"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: 'primary.light' },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
