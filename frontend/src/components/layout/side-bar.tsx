import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth' // Ajustar ruta según donde tengas el hook
import type { SidebarProps } from '../../shared/types/layout'
import { getIcon } from '../../utils/icon-mapper'

const DRAWER_WIDTH = 280

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  menuItems,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const handleNavigation = async (path: string) => {
    // Manejar rutas dinámicas que necesitan workshopId
    if (path === '/services' && user?.role === 'WORKSHOP_OWNER') {
      try {
        // Obtener el primer taller del usuario
        const response = await fetch('http://localhost:4000/api/owner/workshops/mine', {
          credentials: 'include',
        })
        if (response.ok) {
          const workshops = await response.json()
          if (workshops.length > 0) {
            navigate(`/services/${workshops[0].id}`)
          } else {
            navigate('/my-workshops') // Redirigir a crear taller si no tiene
          }
        }
      } catch (error) {
        console.error('Error fetching workshop:', error)
        navigate('/my-workshops')
      }
    } else {
      navigate(path)
    }

    if (isMobile) {
      onClose()
    }
  }

  const getUserRoleText = (role?: string) => {
    switch (role) {
      case 'WORKSHOP_OWNER':
        return 'Propietario de Taller'
      case 'USER':
        return 'Cliente'
      case 'ADMIN':
        return 'Administrador'
      default:
        return 'Usuario'
    }
  }

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          color="primary"
          fontWeight="bold"
        >
          RodaMallorca
        </Typography>
      </Toolbar>
      <Divider />

      {/* Información del usuario */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 1,
            bgcolor: 'primary.main',
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold">
          {user?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getUserRoleText(user?.role)}
        </Typography>
        {user?.role === 'WORKSHOP_OWNER' && (
          <Typography variant="caption" display="block" color="primary">
            Taller
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Menú de navegación */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon>{getIcon(item.icon)}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}
