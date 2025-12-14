import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { Cart } from '@/features/cart/pages/Cart'
import type { AuthContextType, User } from '@/features/auth/providers/auth-providers'
import type { CartContextValue } from '@/features/cart/contexts/CartContext'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/features/cart/hooks/useCart', () => ({
  useCart: vi.fn(),
}))

const { useAuth } = await import('@/features/auth/hooks/useAuth')
const { useCart } = await import('@/features/cart/hooks/useCart')

// Helper para crear mocks
const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  token: null,
  user: null,
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

const createMockCartContext = (overrides: Partial<CartContextValue> = {}): CartContextValue => ({
  cart: { items: [], workshopId: null },
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  getTotalAmount: vi.fn().mockReturnValue(0),
  getItemCount: vi.fn().mockReturnValue(0),
  ...overrides,
})

describe('Cart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show login prompt when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue(createMockAuthContext())
    vi.mocked(useCart).mockReturnValue(createMockCartContext())

    render(<Cart />)

    expect(screen.getByText(/please log in to view your cart/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('should navigate to login when clicking login button', async () => {
    const user = userEvent.setup()

    vi.mocked(useAuth).mockReturnValue(createMockAuthContext())
    vi.mocked(useCart).mockReturnValue(createMockCartContext())

    render(<Cart />)

    const loginButton = screen.getByRole('button', { name: /log in/i })
    await user.click(loginButton)

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('should show empty cart message when cart is empty', () => {
    const mockUser: User = { id: '1', email: 'test@example.com' }

    vi.mocked(useAuth).mockReturnValue(createMockAuthContext({
      user: mockUser,
      isAuthenticated: true,
    }))
    vi.mocked(useCart).mockReturnValue(createMockCartContext())

    render(<Cart />)

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('should display cart items when cart has products', () => {
    const mockUser: User = { id: '1', email: 'test@example.com' }

    const mockCart = {
      items: [
        {
          productId: 'prod-1',
          workshopId: 'workshop-1',
          workshopName: 'Test Workshop',
          name: 'Test Product',
          description: 'Test description',
          price: 10000, // 100.00€
          currency: 'EUR',
          quantity: 2,
        },
      ],
      workshopId: 'workshop-1',
    }

    vi.mocked(useAuth).mockReturnValue(createMockAuthContext({
      user: mockUser,
      isAuthenticated: true,
    }))
    vi.mocked(useCart).mockReturnValue(createMockCartContext({
      cart: mockCart,
      getTotalAmount: vi.fn().mockReturnValue(20000),
      getItemCount: vi.fn().mockReturnValue(2),
    }))

    render(<Cart />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    // Workshop name is shown in a separate card with "Workshop: " prefix
    expect(screen.getByText(/Workshop:.*Test Workshop/i)).toBeInTheDocument()
  })

  it('should call removeFromCart when delete button is clicked', async () => {
    const user = userEvent.setup()
    const mockUser: User = { id: '1', email: 'test@example.com' }
    const mockRemoveFromCart = vi.fn()

    const mockCart = {
      items: [
        {
          productId: 'prod-1',
          workshopId: 'workshop-1',
          workshopName: 'Test Workshop',
          name: 'Test Product',
          description: 'Test description',
          price: 10000,
          currency: 'EUR',
          quantity: 1,
        },
      ],
      workshopId: 'workshop-1',
    }

    vi.mocked(useAuth).mockReturnValue(createMockAuthContext({
      user: mockUser,
      isAuthenticated: true,
    }))
    vi.mocked(useCart).mockReturnValue(createMockCartContext({
      cart: mockCart,
      removeFromCart: mockRemoveFromCart,
      getTotalAmount: vi.fn().mockReturnValue(10000),
      getItemCount: vi.fn().mockReturnValue(1),
    }))

    render(<Cart />)

    const deleteButtons = screen.getAllByTestId('DeleteIcon')
    await user.click(deleteButtons[0].closest('button')!)

    expect(mockRemoveFromCart).toHaveBeenCalledWith('prod-1')
  })

  it('should navigate to checkout when proceed button is clicked', async () => {
    const user = userEvent.setup()
    const mockUser: User = { id: '1', email: 'test@example.com' }

    const mockCart = {
      items: [
        {
          productId: 'prod-1',
          workshopId: 'workshop-1',
          workshopName: 'Test Workshop',
          name: 'Test Product',
          description: 'Test description',
          price: 10000,
          currency: 'EUR',
          quantity: 1,
        },
      ],
      workshopId: 'workshop-1',
    }

    vi.mocked(useAuth).mockReturnValue(createMockAuthContext({
      user: mockUser,
      isAuthenticated: true,
    }))
    vi.mocked(useCart).mockReturnValue(createMockCartContext({
      cart: mockCart,
      getTotalAmount: vi.fn().mockReturnValue(10000),
      getItemCount: vi.fn().mockReturnValue(1),
    }))

    render(<Cart />)

    const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i })
    await user.click(checkoutButton)

    expect(mockNavigate).toHaveBeenCalledWith('/checkout')
  })
})
