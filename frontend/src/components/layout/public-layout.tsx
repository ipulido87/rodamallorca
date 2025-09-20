import { Box, Toolbar } from '@mui/material'
import { PublicFooter } from './public-footer'
import { PublicHeader } from './public-header'

interface PublicLayoutProps {
  children: React.ReactNode
  showFooter?: boolean
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  showFooter = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <PublicHeader />

      {/* Espaciado para el header fijo */}
      <Toolbar />

      {/* Contenido principal */}
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      {/* Footer opcional */}
      {showFooter && <PublicFooter />}
    </Box>
  )
}
