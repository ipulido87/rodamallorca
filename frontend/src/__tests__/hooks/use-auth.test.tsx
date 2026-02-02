import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthContext } from '@/features/auth/providers/auth-providers'
import type { AuthContextType } from '@/features/auth/providers/auth-providers'

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

const createWrapper = (contextValue: AuthContextType) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    )
  }
}

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })

  it('should return auth context when used within AuthProvider', () => {
    const mockContext = createMockAuthContext({
      token: 'test-token',
      isAuthenticated: true,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    })

    expect(result.current.token).toBe('test-token')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should return user data when authenticated', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER' as const,
      hasActiveSubscription: false,
      workshopsCount: 0,
    }

    const mockContext = createMockAuthContext({
      user: mockUser,
      isAuthenticated: true,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('should identify workshop owner correctly', () => {
    const mockContext = createMockAuthContext({
      user: {
        id: '1',
        email: 'owner@example.com',
        name: 'Workshop Owner',
        role: 'WORKSHOP_OWNER',
        hasActiveSubscription: true,
        workshopsCount: 1,
      },
      isWorkshopOwner: true,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    })

    expect(result.current.isWorkshopOwner).toBe(true)
    expect(result.current.user?.role).toBe('WORKSHOP_OWNER')
  })

  it('should expose login function', () => {
    const mockLogin = vi.fn()
    const mockContext = createMockAuthContext({ login: mockLogin })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    })

    expect(result.current.login).toBe(mockLogin)
  })

  it('should expose logout function', () => {
    const mockLogout = vi.fn()
    const mockContext = createMockAuthContext({ logout: mockLogout })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    })

    expect(result.current.logout).toBe(mockLogout)
  })

  it('should return loading state', () => {
    const mockContext = createMockAuthContext({ loading: true })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    })

    expect(result.current.loading).toBe(true)
  })

  it('should return auth error when present', () => {
    const mockContext = createMockAuthContext({
      authError: 'Invalid credentials',
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    })

    expect(result.current.authError).toBe('Invalid credentials')
  })
})
