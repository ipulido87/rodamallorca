import { OrderStatus } from '../../modules/orders/domain/enums/order-status'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { cancelOrder } from '../../modules/orders/application/cancel-order'
import type { Order } from '../../modules/orders/domain/entities/order'
import type { OrderRepository } from '../../modules/orders/domain/repositories/order-repository'

type MockFunction = ReturnType<typeof jest.fn>

interface MockOrderRepository {
  create: MockFunction
  findById: MockFunction
  findByUserId: MockFunction
  findByWorkshopId: MockFunction
  updateStatus: MockFunction
  findByStatus: MockFunction
  delete: MockFunction
}

describe('cancelOrder', () => {
  let mockRepo: MockOrderRepository

  beforeEach(() => {
    jest.clearAllMocks()

    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByWorkshopId: jest.fn(),
      updateStatus: jest.fn(),
      findByStatus: jest.fn(),
      delete: jest.fn(),
    }
  })

  it('debe cancelar un pedido correctamente', async () => {
    const mockOrder: Order = {
      id: 'order-123',
      userId: 'user-123',
      workshopId: 'workshop-123',
      status: OrderStatus.PENDING,
      totalAmount: 10000,
      currency: 'EUR',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockCancelledOrder: Order = {
      ...mockOrder,
      status: OrderStatus.CANCELLED,
    }

    mockRepo.findById.mockResolvedValue(mockOrder)
    mockRepo.updateStatus.mockResolvedValue(mockCancelledOrder)

    const result = await cancelOrder('order-123', {
      repo: mockRepo as unknown as OrderRepository,
      authenticatedUserId: 'user-123',
      userRole: 'USER',
    })

    expect(mockRepo.updateStatus).toHaveBeenCalledWith('order-123', {
      status: OrderStatus.CANCELLED,
    })

    expect(result.status).toBe(OrderStatus.CANCELLED)
  })

  it('debe rechazar si el pedido no existe', async () => {
    mockRepo.findById.mockResolvedValue(null)

    await expect(
      cancelOrder('nonexistent-id', {
        repo: mockRepo as unknown as OrderRepository,
        authenticatedUserId: 'user-123',
        userRole: 'USER',
      })
    ).rejects.toThrow('Pedido no encontrado')
  })

  it('debe rechazar si el usuario no es el dueño del pedido', async () => {
    const mockOrder: Order = {
      id: 'order-123',
      userId: 'user-123',
      workshopId: 'workshop-123',
      status: OrderStatus.PENDING,
      totalAmount: 10000,
      currency: 'EUR',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockRepo.findById.mockResolvedValue(mockOrder)

    await expect(
      cancelOrder('order-123', {
        repo: mockRepo as unknown as OrderRepository,
        authenticatedUserId: 'different-user',
        userRole: 'USER',
      })
    ).rejects.toThrow('No tienes permisos para cancelar este pedido')
  })

  it('debe permitir a un admin cancelar el pedido', async () => {
    const mockOrder: Order = {
      id: 'order-123',
      userId: 'user-123',
      workshopId: 'workshop-123',
      status: OrderStatus.PENDING,
      totalAmount: 10000,
      currency: 'EUR',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockCancelledOrder: Order = {
      ...mockOrder,
      status: OrderStatus.CANCELLED,
    }

    mockRepo.findById.mockResolvedValue(mockOrder)
    mockRepo.updateStatus.mockResolvedValue(mockCancelledOrder)

    const result = await cancelOrder('order-123', {
      repo: mockRepo as unknown as OrderRepository,
      authenticatedUserId: 'admin-123',
      userRole: 'ADMIN',
    })

    expect(result.status).toBe(OrderStatus.CANCELLED)
  })

  it('debe rechazar cancelación de pedido completado', async () => {
    const mockOrder: Order = {
      id: 'order-123',
      userId: 'user-123',
      workshopId: 'workshop-123',
      status: OrderStatus.COMPLETED,
      totalAmount: 10000,
      currency: 'EUR',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockRepo.findById.mockResolvedValue(mockOrder)

    await expect(
      cancelOrder('order-123', {
        repo: mockRepo as unknown as OrderRepository,
        authenticatedUserId: 'user-123',
        userRole: 'USER',
      })
    ).rejects.toThrow('No se puede cancelar un pedido que ya está completado')
  })

  it('debe rechazar cancelación de pedido ya cancelado', async () => {
    const mockOrder: Order = {
      id: 'order-123',
      userId: 'user-123',
      workshopId: 'workshop-123',
      status: OrderStatus.CANCELLED,
      totalAmount: 10000,
      currency: 'EUR',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockRepo.findById.mockResolvedValue(mockOrder)

    await expect(
      cancelOrder('order-123', {
        repo: mockRepo as unknown as OrderRepository,
        authenticatedUserId: 'user-123',
        userRole: 'USER',
      })
    ).rejects.toThrow('El pedido ya está cancelado')
  })

  it('debe permitir cancelar desde cualquier estado excepto COMPLETED y CANCELLED', async () => {
    const statuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.IN_PROGRESS,
      OrderStatus.READY,
    ]

    for (const status of statuses) {
      const mockOrder: Order = {
        id: 'order-123',
        userId: 'user-123',
        workshopId: 'workshop-123',
        status,
        totalAmount: 10000,
        currency: 'EUR',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockCancelledOrder: Order = {
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      }

      mockRepo.findById.mockResolvedValue(mockOrder)
      mockRepo.updateStatus.mockResolvedValue(mockCancelledOrder)

      const result = await cancelOrder('order-123', {
        repo: mockRepo as unknown as OrderRepository,
        authenticatedUserId: 'user-123',
        userRole: 'USER',
      })

      expect(result.status).toBe(OrderStatus.CANCELLED)
    }
  })
})
