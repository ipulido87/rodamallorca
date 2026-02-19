import { Box, CssBaseline, Toolbar } from '@mui/material'
import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth' // Ajustar ruta según donde tengas el hook
import { getMenuItemsForRole } from '../../shared/constants/menu-items'
import type { MainLayoutProps } from '../../shared/types/layout'
import { Sidebar } from './side-bar'
import { TopBar } from './top-bar'

export const MainLayout: React.FC<MainLayoutProps> = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  // Filtrar menús según el rol del usuario
  const filteredMenuItems = useMemo(() => {
    if (!user?.role) return []
    return getMenuItemsForRole(user.role)
  }, [user?.role])

  // Obtener el título de la página actual
  const currentPageTitle = useMemo(() => {
    const currentItem = filteredMenuItems.find(
      (item) => item.path === location.pathname
    )
    return currentItem?.text || 'RodaMallorca'
  }, [location.pathname, filteredMenuItems])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleDrawerClose = () => {
    setMobileOpen(false)
  }

  // Si no hay usuario, no renderizar el layout
  if (!user) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a1628' }}>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <CssBaseline />

      <TopBar
        onMenuClick={handleDrawerToggle}
        currentPageTitle={currentPageTitle}
      />

      <Sidebar
        open={mobileOpen}
        onClose={handleDrawerClose}
        menuItems={filteredMenuItems}
      />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 280px)` },
          background: 'linear-gradient(135deg, #0a1628 0%, #0d1b2a 50%, #0a1628 100%)',
        }}
      >
        <Toolbar /> {/* Espaciado para el AppBar fijo */}
        <Outlet />
      </Box>
    </Box>
  )
}
