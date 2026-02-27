import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Slide,
  Typography,
  Link,
} from '@mui/material'
import { Cookie } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'

const COOKIE_CONSENT_KEY = 'rodamallorca_cookie_consent'

export const CookieBanner = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Pequeño delay para que no aparezca en el primer render
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    setVisible(false)
  }

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            maxWidth: 'lg',
            mx: 'auto',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Cookie sx={{ color: 'primary.main', fontSize: 28, flexShrink: 0 }} />

          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico
            y ofrecerte contenido personalizado. Al hacer clic en «Aceptar», consientes su uso.
            Puedes obtener más información en nuestra{' '}
            <Link component={RouterLink} to="/politica-de-privacidad" color="primary">
              Política de Privacidad
            </Link>
            .
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleReject}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Solo necesarias
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleAccept}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Aceptar todas
            </Button>
          </Box>
        </Box>
      </Box>
    </Slide>
  )
}
