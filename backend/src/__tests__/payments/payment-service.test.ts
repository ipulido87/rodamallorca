import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { WorkshopRepository } from '../../modules/workshops/domain/repositories/workshop-repository'
import type { ProductRepository } from '../../modules/products/domain/repositories/product-repository'
import type { PaymentGateway } from '../../modules/payments/domain/services/payment-gateway'

// Mock stripe-connect.service antes de importar payment-service
jest.mock('../../modules/payments/services/stripe-connect.service', () => ({
  calculateApplicationFee: jest.fn((amount: number) => Math.round(amount * 0.1)),
}))

import {
  createProductCheckoutSession,
  type CreateCheckoutInput,
  type CartItem,
} from '../../modules/payments/application/payment-service'

type MockFunction = ReturnType<typeof jest.fn>

interface MockWorkshopRepo {
  findByIdWithStripe: MockFunction
  updateStripeAccount: MockFunction
}

interface MockProductRepo {
  findByIds: MockFunction
}

interface MockPaymentGateway {
  getConnectedAccount: MockFunction
  createCheckoutSession: MockFunction
}

describe('Payment Service', () => {
  let mockWorkshopRepo: MockWorkshopRepo
  let mockProductRepo: MockProductRepo
  let mockPaymentGateway: MockPaymentGateway

  beforeEach(() => {
    jest.clearAllMocks()

    mockWorkshopRepo = {
      findByIdWithStripe: jest.fn(),
      updateStripeAccount: jest.fn(),
    }

    mockProductRepo = {
      findByIds: jest.fn(),
    }

    mockPaymentGateway = {
      getConnectedAccount: jest.fn(),
      createCheckoutSession: jest.fn(),
    }
  })

  describe('createProductCheckoutSession', () => {
    const validInput: CreateCheckoutInput = {
      userId: 'user-123',
      userEmail: 'test@example.com',
      workshopId: 'workshop-123',
      items: [
        {
          productId: 'product-123',
          quantity: 2,
          priceAtOrder: 5000, // 50€
          currency: 'EUR',
          description: 'Test product',
        },
      ],
      successUrl: 'http://localhost:5173/success',
      cancelUrl: 'http://localhost:5173/cancel',
    }

    const mockWorkshop = {
      id: 'workshop-123',
      name: 'Test Workshop',
      stripeConnectedAccountId: 'acct_123',
      stripeOnboardingComplete: true,
    }

    const mockProduct = {
      id: 'product-123',
      title: 'Test Product',
      description: 'Product description',
      price: 5000,
    }

    const mockStripeAccount = {
      id: 'acct_123',
      detailsSubmitted: true,
      chargesEnabled: true,
      payoutsEnabled: true,
    }

    it('debe crear una sesión de checkout exitosamente', async () => {
      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(mockWorkshop)
      mockPaymentGateway.getConnectedAccount.mockResolvedValue(mockStripeAccount)
      mockProductRepo.findByIds.mockResolvedValue([mockProduct])
      mockPaymentGateway.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      const result = await createProductCheckoutSession(validInput, {
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      // Verificar que se llamó a los métodos correctos
      expect(mockWorkshopRepo.findByIdWithStripe).toHaveBeenCalledWith('workshop-123')
      expect(mockPaymentGateway.getConnectedAccount).toHaveBeenCalledWith('acct_123')
      expect(mockProductRepo.findByIds).toHaveBeenCalledWith(['product-123'])
      expect(mockPaymentGateway.createCheckoutSession).toHaveBeenCalled()
    })

    it('debe lanzar error si el taller no existe', async () => {
      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(null)

      await expect(
        createProductCheckoutSession(validInput, {
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          productRepo: mockProductRepo as unknown as ProductRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('Taller no encontrado')
    })

    it('debe lanzar error si el taller no tiene Stripe Connect configurado', async () => {
      const workshopWithoutStripe = { ...mockWorkshop, stripeConnectedAccountId: null }
      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(workshopWithoutStripe)

      await expect(
        createProductCheckoutSession(validInput, {
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          productRepo: mockProductRepo as unknown as ProductRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('El taller no tiene configurado Stripe Connect')
    })

    it('debe lanzar error si el onboarding de Stripe no está completo', async () => {
      const incompleteAccount = {
        ...mockStripeAccount,
        detailsSubmitted: false,
        chargesEnabled: false,
      }

      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(mockWorkshop)
      mockPaymentGateway.getConnectedAccount.mockResolvedValue(incompleteAccount)

      await expect(
        createProductCheckoutSession(validInput, {
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          productRepo: mockProductRepo as unknown as ProductRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('El taller aún no ha completado la verificación de Stripe')

      // Verificar que se actualizó el estado del onboarding a incompleto
      expect(mockWorkshopRepo.updateStripeAccount).toHaveBeenCalledWith(
        'workshop-123',
        'acct_123',
        false
      )
    })

    it('debe actualizar onboarding en BD si está completo en Stripe pero no en BD', async () => {
      const workshopWithIncompleteOnboarding = {
        ...mockWorkshop,
        stripeOnboardingComplete: false,
      }

      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(workshopWithIncompleteOnboarding)
      mockPaymentGateway.getConnectedAccount.mockResolvedValue(mockStripeAccount)
      mockProductRepo.findByIds.mockResolvedValue([mockProduct])
      mockPaymentGateway.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      await createProductCheckoutSession(validInput, {
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      // Verificar que se actualizó el onboarding a completo
      expect(mockWorkshopRepo.updateStripeAccount).toHaveBeenCalledWith(
        'workshop-123',
        'acct_123',
        true
      )
    })

    it('debe limpiar cuenta inválida si la cuenta de Stripe no existe', async () => {
      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(mockWorkshop)

      const error: any = new Error('No such account')
      error.code = 'resource_missing'
      mockPaymentGateway.getConnectedAccount.mockRejectedValue(error)

      await expect(
        createProductCheckoutSession(validInput, {
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          productRepo: mockProductRepo as unknown as ProductRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('La cuenta de pagos del taller ya no es válida')

      // Verificar que se limpió la cuenta
      expect(mockWorkshopRepo.updateStripeAccount).toHaveBeenCalledWith('workshop-123', null, false)
    })

    it('debe lanzar error si algún producto no existe', async () => {
      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(mockWorkshop)
      mockPaymentGateway.getConnectedAccount.mockResolvedValue(mockStripeAccount)
      mockProductRepo.findByIds.mockResolvedValue([]) // No devuelve productos

      await expect(
        createProductCheckoutSession(validInput, {
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          productRepo: mockProductRepo as unknown as ProductRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('Algunos productos no existen')
    })

    it('debe calcular correctamente el total y la comisión (10%)', async () => {
      const inputMultipleItems: CreateCheckoutInput = {
        ...validInput,
        items: [
          { productId: 'product-1', quantity: 2, priceAtOrder: 5000, currency: 'EUR' },
          { productId: 'product-2', quantity: 1, priceAtOrder: 3000, currency: 'EUR' },
        ],
      }

      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(mockWorkshop)
      mockPaymentGateway.getConnectedAccount.mockResolvedValue(mockStripeAccount)
      mockProductRepo.findByIds.mockResolvedValue([
        { id: 'product-1', title: 'Product 1', description: 'Desc 1', price: 5000 },
        { id: 'product-2', title: 'Product 2', description: 'Desc 2', price: 3000 },
      ])
      mockPaymentGateway.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      await createProductCheckoutSession(inputMultipleItems, {
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      // Total: (2 * 5000) + (1 * 3000) = 13000 centavos (130€)
      // Comisión 10%: 1300 centavos (13€)
      const checkoutCall = mockPaymentGateway.createCheckoutSession.mock.calls[0][0] as any
      expect(checkoutCall.applicationFeeAmount).toBe(1300)
    })

    it('debe incluir información de alquiler en la descripción si es alquiler', async () => {
      const rentalInput: CreateCheckoutInput = {
        ...validInput,
        items: [
          {
            productId: 'product-123',
            quantity: 1,
            priceAtOrder: 5000,
            currency: 'EUR',
            description: 'Bicicleta de montaña',
            isRental: true,
            rentalStartDate: '2026-02-01',
            rentalEndDate: '2026-02-05',
            rentalDays: 4,
            depositPaid: 2000,
          },
        ],
      }

      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(mockWorkshop)
      mockPaymentGateway.getConnectedAccount.mockResolvedValue(mockStripeAccount)
      mockProductRepo.findByIds.mockResolvedValue([mockProduct])
      mockPaymentGateway.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      await createProductCheckoutSession(rentalInput, {
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      const checkoutCall = mockPaymentGateway.createCheckoutSession.mock.calls[0][0] as any
      const lineItem = checkoutCall.lineItems[0]

      // Verificar que la descripción incluye las fechas de alquiler
      expect(lineItem.priceData.productData.description).toContain('Alquiler:')
      expect(lineItem.priceData.productData.description).toContain('4 días')
    })

    it('debe crear sesión con metadata correcta', async () => {
      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(mockWorkshop)
      mockPaymentGateway.getConnectedAccount.mockResolvedValue(mockStripeAccount)
      mockProductRepo.findByIds.mockResolvedValue([mockProduct])
      mockPaymentGateway.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      await createProductCheckoutSession(validInput, {
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      const checkoutCall = mockPaymentGateway.createCheckoutSession.mock.calls[0][0] as any
      expect(checkoutCall.metadata.userId).toBe('user-123')
      expect(checkoutCall.metadata.workshopId).toBe('workshop-123')
      expect(checkoutCall.metadata.workshopName).toBe('Test Workshop')
      expect(checkoutCall.metadata.items).toBeDefined()

      // Verificar que los items están serializados en JSON
      const parsedItems = JSON.parse(checkoutCall.metadata.items)
      expect(parsedItems).toHaveLength(1)
      expect(parsedItems[0].productId).toBe('product-123')
    })

    it('debe limpiar cuenta inválida si falla la creación del checkout', async () => {
      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(mockWorkshop)
      mockPaymentGateway.getConnectedAccount.mockResolvedValue(mockStripeAccount)
      mockProductRepo.findByIds.mockResolvedValue([mockProduct])

      const error: any = new Error('No such destination')
      error.code = 'account_invalid'
      mockPaymentGateway.createCheckoutSession.mockRejectedValue(error)

      await expect(
        createProductCheckoutSession(validInput, {
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          productRepo: mockProductRepo as unknown as ProductRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('La cuenta de pagos del taller no es válida')

      // Verificar que se limpió la cuenta
      expect(mockWorkshopRepo.updateStripeAccount).toHaveBeenCalledWith('workshop-123', null, false)
    })

    it('debe usar Stripe Connect y transferencia a la cuenta del taller', async () => {
      mockWorkshopRepo.findByIdWithStripe.mockResolvedValue(mockWorkshop)
      mockPaymentGateway.getConnectedAccount.mockResolvedValue(mockStripeAccount)
      mockProductRepo.findByIds.mockResolvedValue([mockProduct])
      mockPaymentGateway.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      await createProductCheckoutSession(validInput, {
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      const checkoutCall = mockPaymentGateway.createCheckoutSession.mock.calls[0][0] as any
      expect(checkoutCall.transferDestination).toBe('acct_123')
      expect(checkoutCall.applicationFeeAmount).toBeGreaterThan(0)
    })
  })
})
