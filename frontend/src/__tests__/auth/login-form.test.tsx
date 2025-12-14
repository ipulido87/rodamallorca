import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/features/auth/pages/login-form'
import * as authHook from '@/features/auth/hooks/useAuth'

// Mock del hook useAuth
const mockLogin = vi.fn()
const mockClearError = vi.fn()

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authHook.useAuth).mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      authError: null,
      loading: false,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
    } as any)
  })

  it('should render login form with email and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('should prevent login when email is invalid', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)

    // Type valid password but invalid email (without @)
    await user.type(emailInput, 'notanemail')
    await user.type(passwordInput, 'password123')

    const form = emailInput.closest('form')
    if (form) {
      form.submit()
    }

    // Login should not be called with invalid email
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('should show validation error when password is too short', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  it('should call login function with correct credentials', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should clear previous errors when user types', async () => {
    const user = userEvent.setup()
    vi.mocked(authHook.useAuth).mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      authError: 'Previous error',
      loading: false,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
    } as any)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'a')

    expect(mockClearError).toHaveBeenCalled()
  })

  it('should display error message when login fails', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      authError: 'Invalid credentials',
      loading: false,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
    } as any)

    render(<LoginForm />)

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('should show loading state during login', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      authError: null,
      loading: true,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
    } as any)

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /iniciando sesión\.\.\./i })
    expect(submitButton).toBeDisabled()
  })
})
