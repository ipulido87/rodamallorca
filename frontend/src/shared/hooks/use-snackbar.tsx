import { Alert, Snackbar } from '@mui/material'
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { notify } from '../services/notification-service'

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info'

interface SnackbarMessage {
  message: string
  severity: SnackbarSeverity
  duration?: number
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: SnackbarSeverity, duration?: number) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showWarning: (message: string) => void
  showInfo: (message: string) => void
}

const SnackbarContext = createContext<SnackbarContextType | null>(null)

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<SnackbarMessage>({
    message: '',
    severity: 'info',
    duration: 4000,
  })

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity = 'info', duration = 4000) => {
      setSnackbar({ message, severity, duration })
      setOpen(true)
    },
    []
  )

  const showSuccess = useCallback((message: string) => {
    showSnackbar(message, 'success')
  }, [showSnackbar])

  const showError = useCallback((message: string) => {
    showSnackbar(message, 'error', 6000)
  }, [showSnackbar])

  const showWarning = useCallback((message: string) => {
    showSnackbar(message, 'warning')
  }, [showSnackbar])

  const showInfo = useCallback((message: string) => {
    showSnackbar(message, 'info')
  }, [showSnackbar])

  // 🔥 Registrar el servicio global de notificaciones
  useEffect(() => {
    notify.register(showSnackbar)
    return () => notify.unregister()
  }, [showSnackbar])

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  return (
    <SnackbarContext.Provider
      value={{ showSnackbar, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <Snackbar
        open={open}
        autoHideDuration={snackbar.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider')
  }
  return context
}
