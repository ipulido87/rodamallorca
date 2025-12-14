import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { Cart } from '@/features/cart/pages/Cart'
import * as authHook from '@/features/auth/hooks/useAuth'
import * as cartHook from '@/features/cart/hooks/useCart'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
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

const mockUpdateQuantity = vi.fn()
const mockRemoveFromCart = vi.fn()
const mockClearCart = vi.fn()
const mockGetTotalAmount = vi.fn()
const mockGetItemCount = vi.fn()

describe('Cart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show login prompt when user is not authenticated', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: null,
    } as any)

    vi.mocked(cartHook.useCart).mockReturnValue({
      cart: { items: [], workshopId: null },
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getTotalAmount: mockGetTotalAmount,
      getItemCount: mockGetItemCount,
      addToCart: vi.fn(),
    })

    render(<Cart />)

    expect(screen.getByText(/please log in to view your cart/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('should navigate to login when clicking login button', async () => {
    const user = userEvent.setup()

    vi.mocked(authHook.useAuth).mockReturnValue({
      user: null,
    } as any)

    vi.mocked(cartHook.useCart).mockReturnValue({
      cart: { items: [], workshopId: null },
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getTotalAmount: mockGetTotalAmount,
      getItemCount: mockGetItemCount,
      addToCart: vi.fn(),
    })

    render(<Cart />)

    const loginButton = screen.getByRole('button', { name: /log in/i })
    await user.click(loginButton)

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('should show empty cart message when cart is empty', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
    } as any)

    vi.mocked(cartHook.useCart).mockReturnValue({
      cart: { items: [], workshopId: null },
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getTotalAmount: mockGetTotalAmount,
      getItemCount: mockGetItemCount,
      addToCart: vi.fn(),
    })

    render(<Cart />)

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('should display cart items when cart has products', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
    } as any)

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

    mockGetTotalAmount.mockReturnValue(20000)
    mockGetItemCount.mockReturnValue(2)

    vi.mocked(cartHook.useCart).mockReturnValue({
      cart: mockCart,
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getTotalAmount: mockGetTotalAmount,
      getItemCount: mockGetItemCount,
      addToCart: vi.fn(),
    })

    render(<Cart />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    // Workshop name is shown in a separate card with "Workshop: " prefix
    expect(screen.getByText(/Workshop:.*Test Workshop/i)).toBeInTheDocument()
  })

  it('should call removeFromCart when delete button is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(authHook.useAuth).mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
    } as any)

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

    mockGetTotalAmount.mockReturnValue(10000)
    mockGetItemCount.mockReturnValue(1)

    vi.mocked(cartHook.useCart).mockReturnValue({
      cart: mockCart,
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getTotalAmount: mockGetTotalAmount,
      getItemCount: mockGetItemCount,
      addToCart: vi.fn(),
    })

    render(<Cart />)

    const deleteButtons = screen.getAllByTestId('DeleteIcon')
    await user.click(deleteButtons[0].closest('button')!)

    expect(mockRemoveFromCart).toHaveBeenCalledWith('prod-1')
  })

  it('should navigate to checkout when proceed button is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(authHook.useAuth).mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
    } as any)

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

    mockGetTotalAmount.mockReturnValue(10000)
    mockGetItemCount.mockReturnValue(1)

    vi.mocked(cartHook.useCart).mockReturnValue({
      cart: mockCart,
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getTotalAmount: mockGetTotalAmount,
      getItemCount: mockGetItemCount,
      addToCart: vi.fn(),
    })

    render(<Cart />)

    const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i })
    await user.click(checkoutButton)

    expect(mockNavigate).toHaveBeenCalledWith('/checkout')
  })
})
