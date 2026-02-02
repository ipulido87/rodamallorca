import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress, Alert, Button } from '@mui/material'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useEffect, useState } from 'react'

const MAX_LOADING_TIME = 10000

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  const [isTimeout, setIsTimeout] = useState(false)

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setIsTimeout(true)
      }, MAX_LOADING_TIME)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [loading])

  if (loading && !isTimeout) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (isTimeout) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 3,
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          La verificación de sesión está tardando demasiado. Esto puede ser un problema de conexión.
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            localStorage.clear()
            window.location.href = '/login'
          }}
        >
          Ir a Login
        </Button>
      </Box>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
