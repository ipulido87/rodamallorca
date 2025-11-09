import { OrderStatus, PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { CreateOrderInput } from '../../modules/orders/domain/entities/order'
import { OrderRepositoryPrisma } from '../../modules/orders/infrastructure/persistence/prisma/order-repository-prisma'

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

    repository = new OrderRepositoryPrisma(mockPrisma as unknown as PrismaClient)
  })

  describe('create', () => {
    it('debe crear un pedido con items correctamente', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        workshopId: 'workshop-123',
        notes: 'Test order',
        items: [
          {
            productId: 'product-123',
            quantity: 2,
            priceAtOrder: 5000,
            currency: 'EUR',
          },
          {
            productId: 'product-456',
            quantity: 1,
            priceAtOrder: 3000,
            currency: 'EUR',
          },
        ],
      }

      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: OrderStatus.PENDING,
        totalAmount: 13000, // (2 * 5000) + (1 * 3000)
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

      mockPrisma.order.create.mockResolvedValue(mockOrder)

      const result = await repository.create(input)

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          workshopId: 'workshop-123',
          status: OrderStatus.PENDING,
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
        include: {
          items: true,
        },
      })

      expect(result).toMatchObject({
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: OrderStatus.PENDING,
        totalAmount: 13000,
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: 'product-123',
            quantity: 2,
          }),
          expect.objectContaining({
            productId: 'product-456',
            quantity: 1,
          }),
        ]),
      })
    })
  })

  describe('findById', () => {
    it('debe encontrar un pedido por ID con items', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: OrderStatus.PENDING,
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

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder)

      const result = await repository.findById('order-123', true)

      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        include: { items: true },
      })

      expect(result).toMatchObject({
        id: 'order-123',
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
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-123',
          workshopId: 'workshop-123',
          status: OrderStatus.PENDING,
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
          status: OrderStatus.COMPLETED,
          totalAmount: 20000,
          currency: 'EUR',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        },
      ]

      mockPrisma.order.findMany.mockResolvedValue(mockOrders)

      const result = await repository.findByUserId('user-123', true)

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      })

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('order-1')
      expect(result[1].id).toBe('order-2')
    })
  })

  describe('updateStatus', () => {
    it('debe actualizar el estado de un pedido', async () => {
      const mockUpdatedOrder = {
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: OrderStatus.CONFIRMED,
        totalAmount: 10000,
        currency: 'EUR',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      }

      mockPrisma.order.update.mockResolvedValue(mockUpdatedOrder)

      const result = await repository.updateStatus('order-123', {
        status: OrderStatus.CONFIRMED,
      })

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: OrderStatus.CONFIRMED },
        include: { items: true },
      })

      expect(result.status).toBe(OrderStatus.CONFIRMED)
    })
  })

  describe('delete', () => {
    it('debe eliminar un pedido', async () => {
      mockPrisma.order.delete.mockResolvedValue({
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status: OrderStatus.CANCELLED,
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
