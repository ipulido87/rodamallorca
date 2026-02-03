import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { AuthProvider } from '../features/auth'
import { CartProvider } from '../features/cart/contexts/CartContext'
import { SnackbarProvider } from '../shared/hooks/use-snackbar'
import { ConfirmDialogProvider } from '../shared/hooks/use-confirm-dialog'

const swrConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: true,
  revalidateIfStale: true,
  keepPreviousData: true,
}

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <SWRConfig value={swrConfig}>
        <AuthProvider>
          <CartProvider>
            <SnackbarProvider>
              <ConfirmDialogProvider>
                {children}
              </ConfirmDialogProvider>
            </SnackbarProvider>
          </CartProvider>
        </AuthProvider>
      </SWRConfig>
    </BrowserRouter>
  )
}
