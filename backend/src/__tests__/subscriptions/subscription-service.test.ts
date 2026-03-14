import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { SubscriptionRepository } from '../../modules/subscriptions/domain/repositories/subscription-repository'
import type { WorkshopRepository } from '../../modules/workshops/domain/repositories/workshop-repository'
import type { PaymentGateway } from '../../modules/payments/domain/services/payment-gateway'

// Mock stripe.config antes de importar subscription-service
jest.mock('../../modules/subscriptions/infrastructure/stripe.config', () => ({
  SUBSCRIPTION_PRICE_ID: 'price_test_123',
  TRIAL_PERIOD_DAYS: 30,
}))

import {
  createTrialSubscription,
  createCheckoutSession,
  cancelSubscription,
  checkWorkshopSubscription,
  createBillingPortalSession,
  type CreateSubscriptionInput,
  type CreateCheckoutSessionInput,
} from '../../modules/subscriptions/application/subscription-service'

type MockFunction = ReturnType<typeof jest.fn>

interface MockSubscriptionRepo {
  create: MockFunction
  findByWorkshopId: MockFunction
  update: MockFunction
}

interface MockWorkshopRepo {
  findById: MockFunction
}

interface MockPaymentGateway {
  createCustomer: MockFunction
  createSubscriptionCheckoutSession: MockFunction
  cancelSubscription: MockFunction
  createBillingPortalSession: MockFunction
}

describe('Subscription Service', () => {
  let mockSubscriptionRepo: MockSubscriptionRepo
  let mockWorkshopRepo: MockWorkshopRepo
  let mockPaymentGateway: MockPaymentGateway

  beforeEach(() => {
    jest.clearAllMocks()

    mockSubscriptionRepo = {
      create: jest.fn(),
      findByWorkshopId: jest.fn(),
      update: jest.fn(),
    }

    mockWorkshopRepo = {
      findById: jest.fn(),
    }

    mockPaymentGateway = {
      createCustomer: jest.fn(),
      createSubscriptionCheckoutSession: jest.fn(),
      cancelSubscription: jest.fn(),
      createBillingPortalSession: jest.fn(),
    }
  })

  describe('createTrialSubscription', () => {
    const validInput: CreateSubscriptionInput = {
      workshopId: 'workshop-123',
      ownerEmail: 'owner@example.com',
      ownerName: 'John Doe',
    }

    const mockWorkshop = {
      id: 'workshop-123',
      name: 'Test Workshop',
      ownerId: 'owner-123',
    }

    const mockCustomer = {
      id: 'cus_test_123',
      email: 'owner@example.com',
    }

    it('debe crear una suscripción en trial exitosamente', async () => {
      mockWorkshopRepo.findById.mockResolvedValue(mockWorkshop)
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(null)
      mockPaymentGateway.createCustomer.mockResolvedValue(mockCustomer)

      const mockSubscription = {
        id: 'sub-123',
        workshopId: 'workshop-123',
        stripeCustomerId: 'cus_test_123',
        status: 'TRIALING',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }

      mockSubscriptionRepo.create.mockResolvedValue(mockSubscription)

      const result = await createTrialSubscription(validInput, {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result).toEqual(mockSubscription)
      expect(mockWorkshopRepo.findById).toHaveBeenCalledWith('workshop-123')
      expect(mockPaymentGateway.createCustomer).toHaveBeenCalledWith({
        email: 'owner@example.com',
        name: 'John Doe',
        metadata: { workshopId: 'workshop-123' },
      })
      expect(mockSubscriptionRepo.create).toHaveBeenCalled()

      // Verificar que se pasaron las fechas de trial
      const createCall = mockSubscriptionRepo.create.mock.calls[0][0] as any
      expect(createCall.status).toBe('TRIALING')
      expect(createCall.trialStart).toBeInstanceOf(Date)
      expect(createCall.trialEnd).toBeInstanceOf(Date)
    })

    it('debe lanzar error si el workshop no existe', async () => {
      mockWorkshopRepo.findById.mockResolvedValue(null)

      await expect(
        createTrialSubscription(validInput, {
          subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('Workshop no encontrado')
    })

    it('debe retornar suscripción existente si ya tiene trial', async () => {
      const existingSubscription = {
        id: 'sub-123',
        workshopId: 'workshop-123',
        status: 'TRIALING',
      }

      mockWorkshopRepo.findById.mockResolvedValue(mockWorkshop)
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(existingSubscription)

      const result = await createTrialSubscription(validInput, {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result).toEqual(existingSubscription)
      expect(mockPaymentGateway.createCustomer).not.toHaveBeenCalled()
      expect(mockSubscriptionRepo.create).not.toHaveBeenCalled()
    })

    it('debe crear customer en Stripe con metadata del workshop', async () => {
      mockWorkshopRepo.findById.mockResolvedValue(mockWorkshop)
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(null)
      mockPaymentGateway.createCustomer.mockResolvedValue(mockCustomer)
      mockSubscriptionRepo.create.mockResolvedValue({
        id: 'sub-123',
        workshopId: 'workshop-123',
        stripeCustomerId: 'cus_test_123',
        status: 'TRIALING',
      })

      await createTrialSubscription(validInput, {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(mockPaymentGateway.createCustomer).toHaveBeenCalledWith({
        email: 'owner@example.com',
        name: 'John Doe',
        metadata: { workshopId: 'workshop-123' },
      })
    })
  })

  describe('createCheckoutSession', () => {
    const validInput: CreateCheckoutSessionInput = {
      workshopId: 'workshop-123',
      ownerEmail: 'owner@example.com',
      successUrl: 'http://localhost:5173/success',
      cancelUrl: 'http://localhost:5173/cancel',
    }

    it('debe crear sesión de checkout con customer existente', async () => {
      const existingSubscription = {
        id: 'sub-123',
        workshopId: 'workshop-123',
        stripeCustomerId: 'cus_existing_123',
        status: 'TRIALING',
      }

      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(existingSubscription)
      mockPaymentGateway.createSubscriptionCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      const result = await createCheckoutSession(validInput, {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      expect(mockPaymentGateway.createCustomer).not.toHaveBeenCalled()
      expect(mockPaymentGateway.createSubscriptionCheckoutSession).toHaveBeenCalledWith({
        customerId: 'cus_existing_123',
        email: 'owner@example.com',
        priceId: 'price_test_123',
        trialPeriodDays: 30,
        workshopId: 'workshop-123',
        successUrl: validInput.successUrl,
        cancelUrl: validInput.cancelUrl,
      })
    })

    it('debe crear nuevo customer si no existe suscripción', async () => {
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(null)
      mockPaymentGateway.createCustomer.mockResolvedValue({
        id: 'cus_new_123',
        email: 'owner@example.com',
      })
      mockPaymentGateway.createSubscriptionCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      const result = await createCheckoutSession(validInput, {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      expect(mockPaymentGateway.createCustomer).toHaveBeenCalledWith({
        email: 'owner@example.com',
        metadata: { workshopId: 'workshop-123' },
      })

      expect(mockPaymentGateway.createSubscriptionCheckoutSession).toHaveBeenCalledWith({
        customerId: 'cus_new_123',
        email: 'owner@example.com',
        priceId: 'price_test_123',
        trialPeriodDays: 30,
        workshopId: 'workshop-123',
        successUrl: validInput.successUrl,
        cancelUrl: validInput.cancelUrl,
      })
    })
  })

  describe('cancelSubscription', () => {
    const mockSubscription = {
      id: 'sub-123',
      workshopId: 'workshop-123',
      stripeSubscriptionId: 'sub_stripe_123',
      status: 'ACTIVE' as const,
    }

    it('debe cancelar suscripción inmediatamente', async () => {
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(mockSubscription)
      mockPaymentGateway.cancelSubscription.mockResolvedValue(undefined)

      const updatedSub = { ...mockSubscription, status: 'CANCELED' as const, canceledAt: new Date() }
      mockSubscriptionRepo.update.mockResolvedValue(updatedSub)

      const result = await cancelSubscription('workshop-123', true, {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(mockPaymentGateway.cancelSubscription).toHaveBeenCalledWith('sub_stripe_123', true)
      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith('workshop-123', {
        cancelAtPeriodEnd: false,
        canceledAt: expect.any(Date),
        status: 'CANCELED',
      })
      expect(result.status).toBe('CANCELED')
    })

    it('debe cancelar suscripción al final del período', async () => {
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(mockSubscription)
      mockPaymentGateway.cancelSubscription.mockResolvedValue(undefined)

      const updatedSub = { ...mockSubscription, cancelAtPeriodEnd: true }
      mockSubscriptionRepo.update.mockResolvedValue(updatedSub)

      const result = await cancelSubscription('workshop-123', false, {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(mockPaymentGateway.cancelSubscription).toHaveBeenCalledWith('sub_stripe_123', false)
      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith('workshop-123', {
        cancelAtPeriodEnd: true,
        canceledAt: null,
        status: 'ACTIVE',
      })
      expect(result.cancelAtPeriodEnd).toBe(true)
    })

    it('debe lanzar error si no existe suscripción', async () => {
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(null)

      await expect(
        cancelSubscription('workshop-123', false, {
          subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('Suscripción no encontrada')
    })

    it('debe lanzar error si la suscripción no tiene stripeSubscriptionId', async () => {
      const subscriptionWithoutStripe = { ...mockSubscription, stripeSubscriptionId: null }
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(subscriptionWithoutStripe)

      await expect(
        cancelSubscription('workshop-123', false, {
          subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('Suscripción no encontrada')
    })
  })

  describe('checkWorkshopSubscription', () => {
    it('debe retornar false si no existe suscripción', async () => {
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(null)

      const result = await checkWorkshopSubscription('workshop-123', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result).toEqual({
        hasSubscription: false,
        status: null,
        isActive: false,
      })
    })

    it('debe retornar isActive=true para suscripción ACTIVE', async () => {
      const activeSubscription = {
        id: 'sub-123',
        workshopId: 'workshop-123',
        status: 'ACTIVE' as const,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }

      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(activeSubscription)

      const result = await checkWorkshopSubscription('workshop-123', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result.hasSubscription).toBe(true)
      expect(result.status).toBe('ACTIVE')
      expect(result.isActive).toBe(true)
      expect(result.subscription).toEqual(activeSubscription)
    })

    it('debe retornar isActive=true para suscripción TRIALING válida', async () => {
      const trialingSubscription = {
        id: 'sub-123',
        workshopId: 'workshop-123',
        status: 'TRIALING' as const,
        trialEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }

      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(trialingSubscription)

      const result = await checkWorkshopSubscription('workshop-123', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result.isActive).toBe(true)
      expect(result.status).toBe('TRIALING')
    })

    it('debe retornar isActive=false para trial expirado', async () => {
      const expiredTrialSubscription = {
        id: 'sub-123',
        workshopId: 'workshop-123',
        status: 'TRIALING' as const,
        trialEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expirado ayer
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }

      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(expiredTrialSubscription)

      const result = await checkWorkshopSubscription('workshop-123', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result.isActive).toBe(false)
      expect(result.status).toBe('TRIALING')
    })

    it('debe retornar isActive=true para PAST_DUE dentro del período', async () => {
      const pastDueSubscription = {
        id: 'sub-123',
        workshopId: 'workshop-123',
        status: 'PAST_DUE' as const,
        currentPeriodEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      }

      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(pastDueSubscription)

      const result = await checkWorkshopSubscription('workshop-123', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result.isActive).toBe(true)
      expect(result.status).toBe('PAST_DUE')
    })

    it('debe retornar isActive=false para CANCELED', async () => {
      const canceledSubscription = {
        id: 'sub-123',
        workshopId: 'workshop-123',
        status: 'CANCELED' as const,
        currentPeriodEnd: new Date(),
      }

      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(canceledSubscription)

      const result = await checkWorkshopSubscription('workshop-123', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result.isActive).toBe(false)
      expect(result.status).toBe('CANCELED')
    })
  })

  describe('createBillingPortalSession', () => {
    it('debe crear sesión de portal de facturación', async () => {
      const mockSubscription = {
        id: 'sub-123',
        workshopId: 'workshop-123',
        stripeCustomerId: 'cus_test_123',
      }

      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(mockSubscription)
      mockPaymentGateway.createBillingPortalSession.mockResolvedValue({
        url: 'https://billing.stripe.com/session/test_123',
      })

      const result = await createBillingPortalSession('workshop-123', 'http://localhost:5173/dashboard', {
        subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
      })

      expect(result).toEqual({
        url: 'https://billing.stripe.com/session/test_123',
      })

      expect(mockPaymentGateway.createBillingPortalSession).toHaveBeenCalledWith({
        customerId: 'cus_test_123',
        returnUrl: 'http://localhost:5173/dashboard',
      })
    })

    it('debe lanzar error si no existe suscripción', async () => {
      mockSubscriptionRepo.findByWorkshopId.mockResolvedValue(null)

      await expect(
        createBillingPortalSession('workshop-123', 'http://localhost:5173/dashboard', {
          subscriptionRepo: mockSubscriptionRepo as unknown as SubscriptionRepository,
          workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
          paymentGateway: mockPaymentGateway as unknown as PaymentGateway,
        })
      ).rejects.toThrow('Suscripción no encontrada')
    })
  })
})
