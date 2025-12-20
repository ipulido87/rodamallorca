import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@/__tests__/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/features/auth/pages/login-form'
import type { AuthContextType } from '@/features/auth/providers/auth-providers'

// Mock del módulo useAuth
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Importar después del mock
const { useAuth } = await import('@/features/auth/hooks/useAuth')
const mockedUseAuth = vi.mocked(useAuth)

// Helper para crear mocks de AuthContext con valores por defecto
const createMockAuthContext = (
  overrides: Partial<AuthContextType> = {}
): AuthContextType => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isWorkshopOwner: false,
  loading: false,
  authError: null,

  // ✅ cada fn tipada con LA FIRMA COMPLETA
  login: vi.fn<AuthContextType['login']>(),
  logout: vi.fn<AuthContextType['logout']>(),
  register: vi.fn<AuthContextType['register']>(),
  verifyCode: vi.fn<AuthContextType['verifyCode']>(),
  resendVerification: vi.fn<AuthContextType['resendVerification']>(),
  refreshMe: vi.fn<AuthContextType['refreshMe']>(),
  persistToken: vi.fn<AuthContextType['persistToken']>(),
  clearError: vi.fn<AuthContextType['clearError']>(),

  ...overrides,
})

describe('LoginForm', () => {
  let mockLogin: ReturnType<typeof vi.fn<AuthContextType['login']>>
  let mockClearError: ReturnType<typeof vi.fn<AuthContextType['clearError']>>

  beforeEach(() => {
    mockLogin = vi.fn<AuthContextType['login']>()
    mockClearError = vi.fn<AuthContextType['clearError']>()

    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        login: mockLogin,
        clearError: mockClearError,
      })
    )
  })

  it('should render login form with email and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /iniciar sesión/i })
    ).toBeInTheDocument()
  })

  it('should prevent login when email is invalid', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)

    await user.type(emailInput, 'notanemail')
    await user.type(passwordInput, 'password123')

    const form = emailInput.closest('form')
    form?.submit()

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  it('should show validation error when password is too short', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), '123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  it('should call login function with correct credentials', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should clear previous errors when user types', async () => {
    const user = userEvent.setup()

    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        login: mockLogin,
        clearError: mockClearError,
        authError: 'Previous error',
      })
    )

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'a')
    expect(mockClearError).toHaveBeenCalled()
  })

  it('should display error message when login fails', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        login: mockLogin,
        clearError: mockClearError,
        authError: 'Invalid credentials',
      })
    )

    render(<LoginForm />)
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('should show loading state during login', () => {
    mockedUseAuth.mockReturnValue(
      createMockAuthContext({
        login: mockLogin,
        clearError: mockClearError,
        loading: true,
      })
    )

    render(<LoginForm />)

    expect(
      screen.getByRole('button', { name: /iniciando sesión\.\.\./i })
    ).toBeDisabled()
  })
})
