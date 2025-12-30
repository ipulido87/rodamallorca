import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { confirmDialog } from '../services/confirm-service'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  severity?: 'error' | 'warning' | 'info'
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null)

export const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    title: 'Confirmar',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    severity: 'warning',
  })
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions({
        title: opts.title || 'Confirmar',
        message: opts.message,
        confirmText: opts.confirmText || 'Aceptar',
        cancelText: opts.cancelText || 'Cancelar',
        severity: opts.severity || 'warning',
      })
      setOpen(true)
      setResolveCallback(() => resolve)
    })
  }, [])

  // 🔥 Registrar el servicio global de confirmaciones
  useEffect(() => {
    confirmDialog.register(confirm)
    return () => confirmDialog.unregister()
  }, [confirm])

  const handleConfirm = () => {
    resolveCallback?.(true)
    setOpen(false)
  }

  const handleCancel = () => {
    resolveCallback?.(false)
    setOpen(false)
  }

  const getColor = () => {
    switch (options.severity) {
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'primary'
    }
  }

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={open}
        onClose={handleCancel}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">{options.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {options.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            {options.cancelText}
          </Button>
          <Button onClick={handleConfirm} color={getColor()} variant="contained" autoFocus>
            {options.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  )
}

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider')
  }
  return context
}
