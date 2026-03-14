import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type Stripe from 'stripe'
import type { SubscriptionRepository } from '../../modules/subscriptions/domain/repositories/subscription-repository'
import type { WorkshopRepository } from '../../modules/workshops/domain/repositories/workshop-repository'
import type { OrderRepository } from '../../modules/orders/domain/repositories/order-repository'
import type { ProductRepository } from '../../modules/products/domain/repositories/product-repository'

type MockFunction = ReturnType<typeof jest.fn>

// Mock stripe.config y email-service antes de importar webhook-handler
const mockConstructEvent = jest.fn()
jest.mock('../../modules/subscriptions/infrastructure/stripe.config', () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
  },
}))

jest.mock('../../modules/notifications/services/email-service', () => ({
  sendTrialStartedEmail: jest.fn(),
  sendTrialEndingEmail: jest.fn(),
  sendPaymentSuccessEmail: jest.fn(),
  sendNewOrderEmail: jest.fn(),
}))

// Mock prisma para email sending
jest.mock('../../lib/prisma', () => ({
  default: {
    workshop: {
      findUnique: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
    },
  },
}))

import { handleStripeWebhook } from '../../modules/subscriptions/application/webhook-handler'

interface MockSubscriptionRepo {
  create: MockFunction
  findByWorkshopId: MockFunction
  findByStripeSubscriptionId: MockFunction
  update: MockFunction
}

interface MockWorkshopRepo {
  findById: MockFunction
}

interface MockOrderRepo {
  create: MockFunction
}

interface MockProductRepo {
  findByIds: MockFunction
}

describe('Webhook Handler', () => {
  let mockSubscriptionRepo: MockSubscriptionRepo
  let mockWorkshopRepo: MockWorkshopRepo
  let mockOrderRepo: MockOrderRepo
  let mockProductRepo: MockProductRepo

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'

    mockSubscriptionRepo = {
      create: jest.fn(),
      findByWorkshopId: jest.fn(),
      findByStripeSubscriptionId: jest.fn(),
      update: jest.fn(),
    }

    mockWorkshopRepo = {
      findById: jest.fn(),
    }

    mockOrderRepo = {
      create: jest.fn(),
    }

    mockProductRepo = {
      findByIds: jest.fn(),
    }
  })

  describe('handleStripeWebhook', () => {
    it('debe lanzar error si STRIPE_WEBHOOK_SECRET no está configurado', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET

      await expect(
        handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
          subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          orderRepo: mockOrderRepo as unknown as OrderRepository,
          productRepo: mockProductRepo as unknown as ProductRepository,
        })
      ).rejects.toThrow('STRIPE_WEBHOOK_SECRET no está configurado')
    })

    it('debe lanzar error si la firma es inválida', async () => {
      const error = new Error('Invalid signature')
      mockConstructEvent.mockImplementation(() => {
        throw error
      })

      await expect(
        handleStripeWebhook(Buffer.from('payload'), 'invalid_sig', {
          subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          orderRepo: mockOrderRepo as unknown as OrderRepository,
          productRepo: mockProductRepo as unknown as ProductRepository,
        })
      ).rejects.toThrow('Webhook signature verification failed')
    })

    it('debe procesar evento customer.subscription.created', async () => {
      const mockSubscription: any = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'trialing',
        items: {
          data: [
            {
              id: 'si_test',
              price: { id: 'price_test', unit_amount: 1830 },
            },
          ],
        },
        metadata: { workshopId: 'workshop-123' },
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        trial_start: Math.floor(Date.now() / 1000),
        trial_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      }

      const mockEvent: Partial<Stripe.Event> = {
        id: 'evt_test',
        type: 'customer.subscription.created',
        data: { object: mockSubscription as any },
      }

      mockConstructEvent.mockReturnValue(mockEvent)
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(null)
      mockSubscriptionRepo.create.mockResolvedValue({
        id: 'sub-123',
        workshopId: 'workshop-123',
        stripeSubscriptionId: 'sub_test_123',
      })

      const result = await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        orderRepo: mockOrderRepo as unknown as OrderRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
      })

      expect(result).toEqual({ received: true })
      expect(mockSubscriptionRepo.create).toHaveBeenCalled()

      const createCall = mockSubscriptionRepo.create.mock.calls[0][0] as any
      expect(createCall.workshopId).toBe('workshop-123')
      expect(createCall.stripeSubscriptionId).toBe('sub_test_123')
      expect(createCall.status).toBe('TRIALING')
    })

    it('debe actualizar suscripción existente en customer.subscription.created', async () => {
      const mockSubscription: any = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        items: {
          data: [
            {
              id: 'si_test',
              price: { id: 'price_test' } as any,
            } as any,
          ],
        } as any,
        metadata: { workshopId: 'workshop-123' },
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      }

      const mockEvent: Partial<Stripe.Event> = {
        id: 'evt_test',
        type: 'customer.subscription.created',
        data: { object: mockSubscription as any },
      }

      mockConstructEvent.mockReturnValue(mockEvent)
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue({
        id: 'sub-123',
        workshopId: 'workshop-123',
      })
      mockSubscriptionRepo.update.mockResolvedValue({})

      await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        orderRepo: mockOrderRepo as unknown as OrderRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
      })

      expect(mockSubscriptionRepo.update).toHaveBeenCalled()
      expect(mockSubscriptionRepo.create).not.toHaveBeenCalled()
    })

    it('debe procesar evento customer.subscription.updated', async () => {
      const mockSubscription: any = {
        id: 'sub_test_123',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      }

      const mockEvent: Partial<Stripe.Event> = {
        id: 'evt_test',
        type: 'customer.subscription.updated',
        data: { object: mockSubscription as any },
      }

      mockConstructEvent.mockReturnValue(mockEvent)
      mockSubscriptionRepo.findByStripeSubscriptionId.mockResolvedValue({
        id: 'sub-123',
        workshopId: 'workshop-123',
      })
      mockSubscriptionRepo.update.mockResolvedValue({})

      await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        orderRepo: mockOrderRepo as unknown as OrderRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
      })

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith('workshop-123', {
        status: 'ACTIVE',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        trialStart: null,
        trialEnd: null,
        cancelAtPeriodEnd: undefined,
        canceledAt: null,
      })
    })

    it('debe procesar evento customer.subscription.deleted', async () => {
      const mockSubscription: any = {
        id: 'sub_test_123',
        status: 'canceled',
      }

      const mockEvent: Partial<Stripe.Event> = {
        id: 'evt_test',
        type: 'customer.subscription.deleted',
        data: { object: mockSubscription as any },
      }

      mockConstructEvent.mockReturnValue(mockEvent)
      mockSubscriptionRepo.findByStripeSubscriptionId.mockResolvedValue({
        id: 'sub-123',
        workshopId: 'workshop-123',
      })
      mockSubscriptionRepo.update.mockResolvedValue({})

      await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        orderRepo: mockOrderRepo as unknown as OrderRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
      })

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith('workshop-123', {
        status: 'CANCELED',
        canceledAt: expect.any(Date),
      })
    })

    it('debe procesar evento invoice.payment_succeeded', async () => {
      const mockInvoice: any = {
        id: 'in_test_123',
        subscription: 'sub_test_123',
        amount_paid: 1830,
      }

      const mockEvent: Partial<Stripe.Event> = {
        id: 'evt_test',
        type: 'invoice.payment_succeeded',
        data: { object: mockInvoice as any },
      }

      mockConstructEvent.mockReturnValue(mockEvent)
      mockSubscriptionRepo.findByStripeSubscriptionId.mockResolvedValue({
        id: 'sub-123',
        workshopId: 'workshop-123',
        currentPeriodEnd: new Date(),
      })
      mockSubscriptionRepo.update.mockResolvedValue({})

      await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        orderRepo: mockOrderRepo as unknown as OrderRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
      })

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith('workshop-123', {
        status: 'ACTIVE',
      })
    })

    it('debe procesar evento invoice.payment_failed', async () => {
      const mockInvoice: any = {
        id: 'in_test_123',
        subscription: 'sub_test_123',
      }

      const mockEvent: Partial<Stripe.Event> = {
        id: 'evt_test',
        type: 'invoice.payment_failed',
        data: { object: mockInvoice as any },
      }

      mockConstructEvent.mockReturnValue(mockEvent)
      mockSubscriptionRepo.findByStripeSubscriptionId.mockResolvedValue({
        id: 'sub-123',
        workshopId: 'workshop-123',
      })
      mockSubscriptionRepo.update.mockResolvedValue({})

      await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        orderRepo: mockOrderRepo as unknown as OrderRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
      })

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith('workshop-123', {
        status: 'PAST_DUE',
      })
    })

    it('debe procesar checkout.session.completed para productos', async () => {
      const mockSession: any = {
        id: 'cs_test_123',
        mode: 'payment',
        payment_status: 'paid',
        amount_total: 5000,
        payment_intent: 'pi_test_123',
        metadata: {
          userId: 'user-123',
          workshopId: 'workshop-123',
          items: JSON.stringify([
            {
              productId: 'product-123',
              quantity: 1,
              priceAtOrder: 5000,
              currency: 'EUR',
              description: 'Test product',
              isRental: false,
            },
          ]),
        },
      }

      const mockEvent: Partial<Stripe.Event> = {
        id: 'evt_test',
        type: 'checkout.session.completed',
        data: { object: mockSession as any },
      }

      mockConstructEvent.mockReturnValue(mockEvent)
      mockOrderRepo.create.mockResolvedValue({
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
      })

      await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        orderRepo: mockOrderRepo as unknown as OrderRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
      })

      expect(mockOrderRepo.create).toHaveBeenCalledWith({
        workshopId: 'workshop-123',
        userId: 'user-123',
        notes: null,
        type: 'PRODUCT_ORDER',
        totalAmount: 5000,
        paymentStatus: 'PAID',
        stripeSessionId: 'cs_test_123',
        stripePaymentIntentId: 'pi_test_123',
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: 'product-123',
            quantity: 1,
            priceAtOrder: 5000,
            currency: 'EUR',
            isRental: false,
          }),
        ]),
      })
    })

    it('debe procesar checkout.session.completed para alquileres', async () => {
      const mockSession: any = {
        id: 'cs_test_123',
        mode: 'payment',
        payment_status: 'paid',
        amount_total: 5000,
        payment_intent: 'pi_test_123',
        metadata: {
          userId: 'user-123',
          workshopId: 'workshop-123',
          items: JSON.stringify([
            {
              productId: 'product-123',
              quantity: 1,
              priceAtOrder: 5000,
              currency: 'EUR',
              description: 'Bicicleta',
              isRental: true,
              rentalStartDate: '2026-02-01',
              rentalEndDate: '2026-02-05',
              rentalDays: 4,
              depositPaid: 2000,
            },
          ]),
        },
      }

      const mockEvent: Partial<Stripe.Event> = {
        id: 'evt_test',
        type: 'checkout.session.completed',
        data: { object: mockSession as any },
      }

      mockConstructEvent.mockReturnValue(mockEvent)
      mockOrderRepo.create.mockResolvedValue({
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
      })

      await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        orderRepo: mockOrderRepo as unknown as OrderRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
      })

      expect(mockOrderRepo.create).toHaveBeenCalledWith({
        workshopId: 'workshop-123',
        userId: 'user-123',
        notes: null,
        type: 'RENTAL',
        totalAmount: 5000,
        paymentStatus: 'PAID',
        stripeSessionId: 'cs_test_123',
        stripePaymentIntentId: 'pi_test_123',
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: 'product-123',
            quantity: 1,
            priceAtOrder: 5000,
            currency: 'EUR',
            isRental: true,
            rentalStartDate: expect.any(Date),
            rentalEndDate: expect.any(Date),
            rentalDays: 4,
            depositPaid: 2000,
          }),
        ]),
      })
    })

    it('debe ignorar eventos no manejados', async () => {
      const mockEvent: Partial<Stripe.Event> = {
        id: 'evt_test',
        type: 'customer.created' as any,
        data: { object: {} as any },
      }

      mockConstructEvent.mockReturnValue(mockEvent)

      const result = await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        orderRepo: mockOrderRepo as unknown as OrderRepository,
        productRepo: mockProductRepo as unknown as ProductRepository,
      })

      expect(result).toEqual({ received: true })
      // No debe llamar a ningún método de repositorio
      expect(mockSubscriptionRepo.create).not.toHaveBeenCalled()
      expect(mockSubscriptionRepo.update).not.toHaveBeenCalled()
      expect(mockOrderRepo.create).not.toHaveBeenCalled()
    })

    it('debe mapear correctamente los status de Stripe', async () => {
      const testCases = [
        { stripeStatus: 'trialing', expectedStatus: 'TRIALING' },
        { stripeStatus: 'active', expectedStatus: 'ACTIVE' },
        { stripeStatus: 'past_due', expectedStatus: 'PAST_DUE' },
        { stripeStatus: 'canceled', expectedStatus: 'CANCELED' },
        { stripeStatus: 'unpaid', expectedStatus: 'UNPAID' },
      ]

      for (const testCase of testCases) {
        jest.clearAllMocks()

        const mockSubscription: any = {
          id: 'sub_test_123',
          customer: 'cus_test_123',
          status: testCase.stripeStatus as Stripe.Subscription.Status,
          items: {
            data: [
              {
                id: 'si_test',
                price: { id: 'price_test' } as any,
              } as any,
            ],
          } as any,
          metadata: { workshopId: 'workshop-123' },
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        }

        const mockEvent: Partial<Stripe.Event> = {
          id: 'evt_test',
          type: 'customer.subscription.created',
          data: { object: mockSubscription as any },
        }

        mockConstructEvent.mockReturnValue(mockEvent)
        mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(null)
        mockSubscriptionRepo.create.mockResolvedValue({})

        await handleStripeWebhook(Buffer.from('payload'), 'sig_test', {
          subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          orderRepo: mockOrderRepo as unknown as OrderRepository,
          productRepo: mockProductRepo as unknown as ProductRepository,
        })

        const createCall = mockSubscriptionRepo.create.mock.calls[0][0] as any
        expect(createCall.status).toBe(testCase.expectedStatus)
      }
    })
  })
})
