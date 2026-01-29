import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'

import { OrderRepositoryPrisma } from '../../modules/orders/infrastructure/persistence/prisma/order-repository-prisma'

// Dominio (para asserts)
import { OrderStatus as DomainOrderStatus } from '../../modules/orders/domain/enums/order-status'

import type { CreateOrderRepoInput } from '../../modules/orders/domain/repositories/order-repository'

type MockFunction = ReturnType<typeof jest.fn>

interface MockPrismaClient {
  order: {
    create: MockFunction
    findUnique: MockFunction
    findMany: MockFunction
    update: MockFunction
    delete: MockFunction
  }
}

describe('OrderRepositoryPrisma', () => {
  let mockPrisma: MockPrismaClient
  let repository: OrderRepositoryPrisma

  beforeEach(() => {
    jest.clearAllMocks()

    mockPrisma = {
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }

    repository = new OrderRepositoryPrisma(
      mockPrisma as unknown as PrismaClient
    )
  })

  describe('create', () => {
    it('debe crear un pedido con campos de pago de Stripe', async () => {
      const input: CreateOrderRepoInput = {
        userId: 'user-123',
        workshopId: 'workshop-123',
        totalAmount: 10000,
        notes: 'Order with payment',
        items: [
          {
            productId: 'product-123',
            quantity: 1,
            priceAtOrder: 10000,
            currency: 'EUR',
            description: 'Test product',
          },
        ],
        // Campos de pago de Stripe
        paymentStatus: 'PAID',
        stripeSessionId: 'cs_test_123',
        stripePaymentIntentId: 'pi_test_123',
      }

      const mockOrderFromPrisma = {
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: 'PENDING',
        type: 'PRODUCT_ORDER',
        totalAmount: 10000,
        currency: 'EUR',
        notes: 'Order with payment',
        paymentStatus: 'PAID',
        stripeSessionId: 'cs_test_123',
        stripePaymentIntentId: 'pi_test_123',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 'item-1',
            orderId: 'order-123',
            productId: 'product-123',
            quantity: 1,
            priceAtOrder: 10000,
            currency: 'EUR',
            description: 'Test product',
            isRental: false,
            rentalStartDate: null,
            rentalEndDate: null,
            rentalDays: null,
            depositPaid: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }

      mockPrisma.order.create.mockResolvedValue(mockOrderFromPrisma)

      const result = await repository.create(input)

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 'user-123' } },
          workshop: { connect: { id: 'workshop-123' } },
          status: 'PENDING',
          type: 'PRODUCT_ORDER',
          totalAmount: 10000,
          currency: 'EUR',
          notes: 'Order with payment',
          // Campos de pago
          paymentStatus: 'PAID',
          stripeSessionId: 'cs_test_123',
          stripePaymentIntentId: 'pi_test_123',
          items: {
            create: [
              {
                productId: 'product-123',
                quantity: 1,
                priceAtOrder: 10000,
                currency: 'EUR',
                description: 'Test product',
                isRental: false,
                rentalStartDate: null,
                rentalEndDate: null,
                rentalDays: null,
                depositPaid: null,
              },
            ],
          },
        },
        include: { items: true },
      })

      expect(result).toMatchObject({
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        totalAmount: 10000,
      })
    })

    it('debe crear un pedido con items correctamente', async () => {
      const input: CreateOrderRepoInput = {
        userId: 'user-123',
        workshopId: 'workshop-123',
        totalAmount: 13000,
        notes: 'Test order',
        items: [
          {
            productId: 'product-123',
            quantity: 2,
            priceAtOrder: 5000,
            currency: 'EUR',
            description: null,
          },
          {
            productId: 'product-456',
            quantity: 1,
            priceAtOrder: 3000,
            currency: 'EUR',
            description: null,
          },
        ],
      }

      const mockOrderFromPrisma = {
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: 'PENDING',
        totalAmount: 13000,
        currency: 'EUR',
        notes: 'Test order',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 'item-1',
            orderId: 'order-123',
            productId: 'product-123',
            quantity: 2,
            priceAtOrder: 5000,
            currency: 'EUR',
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'item-2',
            orderId: 'order-123',
            productId: 'product-456',
            quantity: 1,
            priceAtOrder: 3000,
            currency: 'EUR',
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }

      mockPrisma.order.create.mockResolvedValue(mockOrderFromPrisma)

      const result = await repository.create(input)

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          workshopId: 'workshop-123',
          status: 'PENDING',
          totalAmount: 13000,
          currency: 'EUR',
          notes: 'Test order',
          items: {
            create: [
              {
                productId: 'product-123',
                quantity: 2,
                priceAtOrder: 5000,
                currency: 'EUR',
                description: null,
              },
              {
                productId: 'product-456',
                quantity: 1,
                priceAtOrder: 3000,
                currency: 'EUR',
                description: null,
              },
            ],
          },
        },
        include: { items: true },
      })

      expect(result).toMatchObject({
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: DomainOrderStatus.PENDING,
        totalAmount: 13000,
        items: expect.arrayContaining([
          expect.objectContaining({ productId: 'product-123', quantity: 2 }),
          expect.objectContaining({ productId: 'product-456', quantity: 1 }),
        ]),
      })
    })

    it('debe crear un pedido de alquiler con campos de pago', async () => {
      const input: CreateOrderRepoInput = {
        userId: 'user-123',
        workshopId: 'workshop-123',
        totalAmount: 5000,
        notes: 'Rental order',
        type: 'RENTAL',
        items: [
          {
            productId: 'product-123',
            quantity: 1,
            priceAtOrder: 5000,
            currency: 'EUR',
            description: 'Bicicleta de montaña',
            // Campos de alquiler
            isRental: true,
            rentalStartDate: new Date('2026-02-01'),
            rentalEndDate: new Date('2026-02-05'),
            rentalDays: 4,
            depositPaid: 2000,
          },
        ],
        // Campos de pago de Stripe
        paymentStatus: 'PAID',
        stripeSessionId: 'cs_rental_123',
        stripePaymentIntentId: 'pi_rental_123',
      }

      const mockOrderFromPrisma = {
        id: 'order-rental-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: 'PENDING',
        type: 'RENTAL',
        totalAmount: 5000,
        currency: 'EUR',
        notes: 'Rental order',
        paymentStatus: 'PAID',
        stripeSessionId: 'cs_rental_123',
        stripePaymentIntentId: 'pi_rental_123',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 'item-rental-1',
            orderId: 'order-rental-123',
            productId: 'product-123',
            quantity: 1,
            priceAtOrder: 5000,
            currency: 'EUR',
            description: 'Bicicleta de montaña',
            isRental: true,
            rentalStartDate: new Date('2026-02-01'),
            rentalEndDate: new Date('2026-02-05'),
            rentalDays: 4,
            depositPaid: 2000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }

      mockPrisma.order.create.mockResolvedValue(mockOrderFromPrisma)

      const result = await repository.create(input)

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 'user-123' } },
          workshop: { connect: { id: 'workshop-123' } },
          status: 'PENDING',
          type: 'RENTAL',
          totalAmount: 5000,
          currency: 'EUR',
          notes: 'Rental order',
          // Campos de pago
          paymentStatus: 'PAID',
          stripeSessionId: 'cs_rental_123',
          stripePaymentIntentId: 'pi_rental_123',
          items: {
            create: [
              {
                productId: 'product-123',
                quantity: 1,
                priceAtOrder: 5000,
                currency: 'EUR',
                description: 'Bicicleta de montaña',
                isRental: true,
                rentalStartDate: new Date('2026-02-01'),
                rentalEndDate: new Date('2026-02-05'),
                rentalDays: 4,
                depositPaid: 2000,
              },
            ],
          },
        },
        include: { items: true },
      })

      expect(result).toMatchObject({
        id: 'order-rental-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        totalAmount: 5000,
      })
    })
  })

  describe('findById', () => {
    it('debe encontrar un pedido por ID con items', async () => {
      const mockOrderFromPrisma = {
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: 'PENDING',
        totalAmount: 10000,
        currency: 'EUR',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 'item-1',
            orderId: 'order-123',
            productId: 'product-123',
            quantity: 2,
            priceAtOrder: 5000,
            currency: 'EUR',
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }

      mockPrisma.order.findUnique.mockResolvedValue(mockOrderFromPrisma)

      const result = await repository.findById('order-123', true)

      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        include: { items: true },
      })

      expect(result).toMatchObject({
        id: 'order-123',
        status: DomainOrderStatus.PENDING,
        items: expect.arrayContaining([
          expect.objectContaining({ productId: 'product-123' }),
        ]),
      })
    })

    it('debe retornar null si el pedido no existe', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null)

      const result = await repository.findById('nonexistent-id', false)

      expect(result).toBeNull()
    })
  })

  describe('findByUserId', () => {
    it('debe encontrar todos los pedidos de un usuario', async () => {
      const mockOrdersFromPrisma = [
        {
          id: 'order-1',
          userId: 'user-123',
          workshopId: 'workshop-123',
          status: 'PENDING',
          totalAmount: 10000,
          currency: 'EUR',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        },
        {
          id: 'order-2',
          userId: 'user-123',
          workshopId: 'workshop-456',
          status: 'COMPLETED',
          totalAmount: 20000,
          currency: 'EUR',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        },
      ]

      mockPrisma.order.findMany.mockResolvedValue(mockOrdersFromPrisma)

      const result = await repository.findByUserId('user-123', true)

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      })

      expect(result).toHaveLength(2)
      expect(result[0].status).toBe(DomainOrderStatus.PENDING)
      expect(result[1].status).toBe(DomainOrderStatus.COMPLETED)
    })
  })

  describe('updateStatus', () => {
    it('debe actualizar el estado de un pedido', async () => {
      const mockUpdatedOrderFromPrisma = {
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: 'CONFIRMED',
        totalAmount: 10000,
        currency: 'EUR',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      }

      mockPrisma.order.update.mockResolvedValue(mockUpdatedOrderFromPrisma)

      const result = await repository.updateStatus('order-123', {
        status: DomainOrderStatus.CONFIRMED,
      })

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: 'CONFIRMED' },
        include: { items: true },
      })

      expect(result.status).toBe(DomainOrderStatus.CONFIRMED)
    })
  })

  describe('delete', () => {
    it('debe eliminar un pedido', async () => {
      mockPrisma.order.delete.mockResolvedValue({
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: 'CANCELLED',
        totalAmount: 10000,
        currency: 'EUR',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await repository.delete('order-123')

      expect(mockPrisma.order.delete).toHaveBeenCalledWith({
        where: { id: 'order-123' },
      })
    })
  })
})
