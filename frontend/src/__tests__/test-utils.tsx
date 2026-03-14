import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../features/auth'
import { CartProvider } from '../features/cart/contexts/CartContext'

interface AllTheProvidersProps {
  children: React.ReactNode
}

/* eslint-disable react-refresh/only-export-components */
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

/* eslint-disable react-refresh/only-export-components */

export * from '@testing-library/react'
export { customRender as render }
