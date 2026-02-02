import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PrivateRoute } from '@/components/private-ruta'
import type { AuthContextType } from '@/features/auth/providers/auth-providers'

// Mock useAuth hook
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const { useAuth } = await import('@/features/auth/hooks/useAuth')
const mockedUseAuth = vi.mocked(useAuth)

const createMockAuthContext = (
  overrides: Partial<AuthContextType> = {}
): AuthContextType => ({
  token: null,
  user: null,
  setUser: vi.fn(),
  isAuthenticated: false,
  isWorkshopOwner: false,
  loading: false,
  authError: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  verifyCode: vi.fn(),
  resendVerification: vi.fn(),
  refreshMe: vi.fn(),
  persistToken: vi.fn(),
  clearError: vi.fn(),
  ...overrides,
})

const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/protected'] } = {}
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/protected" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should show loading spinner while loading', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        loading: true,
        isAuthenticated: false,
      })
    )

    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        loading: false,
        isAuthenticated: false,
      })
    )

    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('should render children when authenticated', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        loading: false,
        isAuthenticated: true,
      })
    )

    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should show timeout error after 10 seconds of loading', async () => {
    vi.useFakeTimers()

    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        loading: true,
        isAuthenticated: false,
      })
    )

    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    // Fast-forward past the timeout
    await act(async () => {
      vi.advanceTimersByTime(10001)
    })

    expect(
      screen.getByText(/la verificación de sesión está tardando demasiado/i)
    ).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('should show "Ir a Login" button on timeout', async () => {
    vi.useFakeTimers()

    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        loading: true,
        isAuthenticated: false,
      })
    )

    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )

    await act(async () => {
      vi.advanceTimersByTime(10001)
    })

    expect(
      screen.getByRole('button', { name: /ir a login/i })
    ).toBeInTheDocument()
  })

  it('should clear timeout when loading completes before timeout', () => {
    const { rerender } = renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )

    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        loading: true,
        isAuthenticated: false,
      })
    )

    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div>Protected Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Update to authenticated state before timeout
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        loading: false,
        isAuthenticated: true,
      })
    )

    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div>Protected Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Should show protected content, not timeout error
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should render timeout UI with error message and button', async () => {
    vi.useFakeTimers()

    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        loading: true,
        isAuthenticated: false,
      })
    )

    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )

    await act(async () => {
      vi.advanceTimersByTime(10001)
    })

    // Verify all timeout UI elements
    expect(
      screen.getByText(/la verificación de sesión está tardando demasiado/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/problema de conexión/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /ir a login/i })
    ).toBeInTheDocument()
  })
})
