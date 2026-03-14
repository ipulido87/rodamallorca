import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoleRoute } from '@/components/role-route'
import type { AuthContextType } from '@/features/auth/providers/auth-providers'

// Mock useAuth hook
vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
}))

const { useAuth } = await import('@/features/auth')
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
        <Route path="/home" element={<div>Home Page</div>} />
        <Route
          path="/activate-subscription"
          element={<div>Activate Subscription Page</div>}
        />
        <Route path="/custom-fallback" element={<div>Custom Fallback</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RoleRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render null while loading', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        loading: true,
      })
    )

    const { container } = renderWithRouter(
      <RoleRoute requiredRole="USER">
        <div>Protected Content</div>
      </RoleRoute>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should redirect to login when not authenticated', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        isAuthenticated: false,
        loading: false,
      })
    )

    renderWithRouter(
      <RoleRoute requiredRole="USER">
        <div>Protected Content</div>
      </RoleRoute>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('should redirect to fallback when user role does not match', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        isAuthenticated: true,
        loading: false,
        user: {
          id: '1',
          email: 'user@test.com',
          name: 'Test User',
          role: 'USER',
          hasActiveSubscription: false,
          workshopsCount: 0,
        },
      })
    )

    renderWithRouter(
      <RoleRoute requiredRole="WORKSHOP_OWNER">
        <div>Protected Content</div>
      </RoleRoute>
    )

    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })

  it('should redirect to custom fallback when specified', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        isAuthenticated: true,
        loading: false,
        user: {
          id: '1',
          email: 'user@test.com',
          name: 'Test User',
          role: 'USER',
          hasActiveSubscription: false,
          workshopsCount: 0,
        },
      })
    )

    renderWithRouter(
      <RoleRoute requiredRole="ADMIN" fallback="/custom-fallback">
        <div>Protected Content</div>
      </RoleRoute>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
  })

  it('should render children when user role matches', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        isAuthenticated: true,
        loading: false,
        user: {
          id: '1',
          email: 'user@test.com',
          name: 'Test User',
          role: 'USER',
          hasActiveSubscription: false,
          workshopsCount: 0,
        },
      })
    )

    renderWithRouter(
      <RoleRoute requiredRole="USER">
        <div>Protected Content</div>
      </RoleRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should redirect WORKSHOP_OWNER without subscription to activate-subscription', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        isAuthenticated: true,
        loading: false,
        user: {
          id: '1',
          email: 'owner@test.com',
          name: 'Workshop Owner',
          role: 'WORKSHOP_OWNER',
          hasActiveSubscription: false,
          workshopsCount: 1,
        },
      })
    )

    renderWithRouter(
      <RoleRoute requiredRole="WORKSHOP_OWNER">
        <div>Dashboard</div>
      </RoleRoute>
    )

    expect(screen.getByText('Activate Subscription Page')).toBeInTheDocument()
  })

  it('should render children for WORKSHOP_OWNER with active subscription', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        isAuthenticated: true,
        loading: false,
        user: {
          id: '1',
          email: 'owner@test.com',
          name: 'Workshop Owner',
          role: 'WORKSHOP_OWNER',
          hasActiveSubscription: true,
          workshopsCount: 1,
        },
      })
    )

    renderWithRouter(
      <RoleRoute requiredRole="WORKSHOP_OWNER">
        <div>Dashboard</div>
      </RoleRoute>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should render children for ADMIN role', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        isAuthenticated: true,
        loading: false,
        user: {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'ADMIN',
          hasActiveSubscription: false,
          workshopsCount: 0,
        },
      })
    )

    renderWithRouter(
      <RoleRoute requiredRole="ADMIN">
        <div>Admin Panel</div>
      </RoleRoute>
    )

    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })
})
