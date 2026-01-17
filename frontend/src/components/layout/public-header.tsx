// components/layout/PublicHeader.tsx

import {
  DirectionsBike,
  PedalBike,
  ExpandMore,
  Logout,
  Person,
  Settings,
} from '@mui/icons-material'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Grow,
  ListItemIcon,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Slide,
  Stack,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material'
import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

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
  const { user, isAuthenticated, logout } = useAuth()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const isLoginPage = location.pathname === '/login'
  const isRegisterPage = location.pathname === '/register'

  const handleDropdownToggle = () => {
    setDropdownOpen((prevOpen) => !prevOpen)
  }

  const handleDropdownClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }
    setDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const handleProfile = () => {
    navigate('/profile')
    setDropdownOpen(false)
  }

  const handleSettings = () => {
    navigate('/settings')
    setDropdownOpen(false)
  }

  return (
    <HideOnScroll>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
              },
            }}
            onClick={() => navigate('/')}
          >
            <DirectionsBike
              sx={{
                color: 'primary.main',
                fontSize: 36,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}
            />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                display: { xs: 'none', sm: 'block' },
                background: 'linear-gradient(45deg, #3949ab, #5c6bc0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              RodaMallorca
            </Typography>
          </Stack>

          <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
            {/* Botón de Alquiler - visible para todos */}
            <Button
              variant="contained"
              onClick={() => navigate('/rentals')}
              startIcon={<PedalBike sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
              sx={{
                bgcolor: 'success.main',
                color: 'white',
                px: { xs: 2, sm: 3 },
                py: 1,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                '&:hover': {
                  bgcolor: 'success.dark',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                },
              }}
            >
              Alquiler
            </Button>

            {isAuthenticated ? (
              <>
                <Button
                  variant="text"
                  onClick={() => navigate('/catalog')}
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    color: 'primary.main',
                    px: 2,
                    py: 1,
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  Tienda
                </Button>

                <Box>
                  <Button
                    ref={anchorRef}
                    onClick={handleDropdownToggle}
                    endIcon={
                      <ExpandMore
                        sx={{
                          transform: dropdownOpen
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    }
                    sx={{
                      borderRadius: 4,
                      p: 1,
                      pr: 1.5,
                      bgcolor: dropdownOpen
                        ? 'background.paper'
                        : 'transparent',
                      boxShadow: dropdownOpen
                        ? '0 4px 20px rgba(0,0,0,0.08)'
                        : 'none',
                      '&:hover': {
                        bgcolor: 'background.paper',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor:
                            user?.role === 'WORKSHOP_OWNER'
                              ? 'warning.main'
                              : 'primary.main',
                          fontSize: 18,
                          fontWeight: 700,
                          boxShadow:
                            user?.role === 'WORKSHOP_OWNER'
                              ? '0 4px 16px rgba(255, 183, 77, 0.3)'
                              : '0 4px 16px rgba(57, 73, 171, 0.3)',
                          border: '3px solid white',
                        }}
                      >
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </Avatar>

                      <Stack
                        direction="column"
                        sx={{
                          display: { xs: 'none', md: 'flex' },
                          alignItems: 'flex-start',
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.primary"
                          sx={{
                            lineHeight: 1.2,
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {user?.name || 'Usuario'}
                        </Typography>
                        <Chip
                          label={
                            user?.role === 'WORKSHOP_OWNER'
                              ? 'Propietario'
                              : 'Cliente'
                          }
                          size="small"
                          variant="filled"
                          sx={{
                            height: 22,
                            fontSize: 11,
                            fontWeight: 500,
                            bgcolor:
                              user?.role === 'WORKSHOP_OWNER'
                                ? 'warning.light'
                                : 'info.light',
                            color:
                              user?.role === 'WORKSHOP_OWNER'
                                ? 'warning.dark'
                                : 'info.dark',
                            '& .MuiChip-label': {
                              px: 1.5,
                            },
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Button>

                  <Popper
                    open={dropdownOpen}
                    anchorEl={anchorRef.current}
                    placement="bottom-end"
                    transition
                    disablePortal
                    sx={{ zIndex: 1300 }}
                  >
                    {({ TransitionProps }) => (
                      <Grow {...TransitionProps}>
                        <Paper
                          sx={{
                            mt: 1,
                            minWidth: 200,
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <ClickAwayListener onClickAway={handleDropdownClose}>
                            <MenuList
                              autoFocusItem={dropdownOpen}
                              sx={{ py: 1 }}
                            >
                              <MenuItem
                                onClick={handleProfile}
                                sx={{
                                  borderRadius: 2,
                                  mx: 1,
                                  my: 0.5,
                                  py: 1.5,
                                  '&:hover': {
                                    bgcolor: 'secondary.light',
                                  },
                                }}
                              >
                                <ListItemIcon>
                                  <Person sx={{ color: 'secondary.main' }} />
                                </ListItemIcon>
                                <Typography variant="body2" fontWeight={500}>
                                  Mi Perfil
                                </Typography>
                              </MenuItem>

                              <MenuItem
                                onClick={handleSettings}
                                sx={{
                                  borderRadius: 2,
                                  mx: 1,
                                  my: 0.5,
                                  py: 1.5,
                                  '&:hover': {
                                    bgcolor: 'secondary.light',
                                  },
                                }}
                              >
                                <ListItemIcon>
                                  <Settings sx={{ color: 'secondary.main' }} />
                                </ListItemIcon>
                                <Typography variant="body2" fontWeight={500}>
                                  Configuración
                                </Typography>
                              </MenuItem>

                              <MenuItem
                                onClick={handleLogout}
                                sx={{
                                  borderRadius: 2,
                                  mx: 1,
                                  my: 0.5,
                                  py: 1.5,
                                  '&:hover': {
                                    bgcolor: 'error.light',
                                    color: 'error.dark',
                                  },
                                }}
                              >
                                <ListItemIcon>
                                  <Logout sx={{ color: 'error.main' }} />
                                </ListItemIcon>
                                <Typography variant="body2" fontWeight={500}>
                                  Cerrar Sesión
                                </Typography>
                              </MenuItem>
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </Box>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={() => navigate('/catalog')}
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    color: 'primary.main',
                    fontWeight: 500,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  Tienda
                </Button>

                {!isLoginPage && (
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/login')}
                    sx={{
                      display: { xs: 'none', sm: 'inline-flex' },
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      px: { xs: 2, sm: 3 },
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.light',
                        color: 'white',
                      },
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                )}

                {!isRegisterPage && (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: 'primary.main',
                      px: { xs: 2, sm: 3 },
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    {isLoginPage ? 'Crear Cuenta' : 'Registrarse'}
                  </Button>
                )}
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  )
}
