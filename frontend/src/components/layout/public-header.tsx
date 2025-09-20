// components/layout/PublicHeader.tsx

import { DirectionsBike } from '@mui/icons-material'
import {
  AppBar,
  Button,
  Slide,
  Stack,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

interface HideOnScrollProps {
  children: React.ReactElement
}

function HideOnScroll(props: HideOnScrollProps) {
  const { children } = props
  const trigger = useScrollTrigger()

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  )
}

export const PublicHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isLoginPage = location.pathname === '/login'
  const isRegisterPage = location.pathname === '/register'

  return (
    <HideOnScroll>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <DirectionsBike sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              RodaMallorca
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            {!isLoginPage && (
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  borderRadius: 2,
                }}
              >
                Iniciar Sesión
              </Button>
            )}

            {!isRegisterPage && (
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ borderRadius: 2 }}
              >
                {isLoginPage ? 'Crear Cuenta' : 'Registrarse'}
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  )
}
