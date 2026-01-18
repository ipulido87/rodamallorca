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
import { useRealtimeNotifications } from '../../shared/hooks/use-realtime-notifications'
import { NotificationBadge } from '../notifications/notification-badge'
import { API } from '../../features/auth/services/auth-service'

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
  const { unreadCount, clearUnread } = useRealtimeNotifications()

  const handleNavigation = async (path: string) => {
    // Limpiar notificaciones no leídas si va a pedidos del taller
    if (path === '/workshop-orders') {
      clearUnread()
    }

    // Manejar rutas dinámicas que necesitan workshopId
    if ((path === '/services' || path === '/billing') && user?.role === 'WORKSHOP_OWNER') {
      try {
        // Obtener el primer taller del usuario
        const { data: workshops } = await API.get('/owner/workshops/mine')
        if (workshops && workshops.length > 0) {
          navigate(`${path}/${workshops[0].id}`)
        } else {
          navigate('/my-workshops') // Redirigir a crear taller si no tiene
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
          onClick={() => navigate('/')}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
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
              <ListItemIcon>
                {item.path === '/workshop-orders' && unreadCount > 0 ? (
                  <NotificationBadge count={unreadCount}>
                    {getIcon(item.icon)}
                  </NotificationBadge>
                ) : (
                  getIcon(item.icon)
                )}
              </ListItemIcon>
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
