import { Box, Toolbar } from '@mui/material'
import { AnimatedBackground } from '../../shared/components/AnimatedBackground'
import { PublicFooter } from './public-footer'
import { PublicHeader } from './public-header'
import { BusinessAssistantWidget } from '../../shared/components/BusinessAssistantWidget'

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
        position: 'relative',
      }}
    >
      {/* Fixed animated background for all public pages */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <AnimatedBackground />
      </Box>

      <PublicHeader />

      {/* Espaciado para el header fijo */}
      <Toolbar />

      {/* Contenido principal con glass overlay for readability */}
      <Box
        component="main"
        sx={{
          flex: 1,
          position: 'relative',
          zIndex: 1,
          bgcolor: 'rgba(248, 250, 252, 0.93)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {children}
      </Box>

      <BusinessAssistantWidget />

      {/* Footer opcional */}
      {showFooter && <PublicFooter />}
    </Box>
  )
}
