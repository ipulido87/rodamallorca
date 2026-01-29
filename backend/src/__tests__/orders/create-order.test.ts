import { beforeEach, describe, expect, it, jest } from '@jest/globals'

// Mock the email service to avoid @react-pdf/renderer issues
jest.mock('../../modules/notifications/services/email-service', () => ({
  sendInvoiceEmail: jest.fn(),
  sendNewOrderEmail: jest.fn(),
}))

// Mock the push service
jest.mock('../../modules/notifications/services/push-service', () => ({
  sendNewOrderPush: jest.fn(),
}))

// Mock rental availability service to avoid Prisma issues
jest.mock('../../modules/rentals/services/rental-availability.service', () => ({
  checkAvailability: jest.fn(),
}))

import { createOrder } from '../../modules/orders/application/create-order'
import { OrderStatus } from '../../modules/orders/domain/enums/order-status'

import type {
  CreateOrderInput,
  Order,
} from '../../modules/orders/domain/entities/order'

import type { OrderRepository } from '../../modules/orders/domain/repositories/order-repository'
import type { WorkshopRepository } from '../../modules/workshops/domain/repositories/workshop-repository'

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

interface MockWorkshopRepository {
  findById: MockFunction
}

describe('createOrder', () => {
  let mockRepo: MockOrderRepository
  let mockWorkshopRepo: MockWorkshopRepository

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

    mockWorkshopRepo = {
      findById: jest.fn(),
    }
  })

  it('debe crear un pedido correctamente', async () => {
    const input: CreateOrderInput = {
      userId: 'user-123',
      workshopId: 'workshop-123',
      notes: 'Test order',
      items: [
        {
          productId: 'product-123',
          quantity: 2,
          priceAtOrder: 5000,
        },
      ],
    }

    const expectedOrder: Order = {
      id: 'order-123',
      userId: 'user-123',
      workshopId: 'workshop-123',
      status: OrderStatus.PENDING,
      totalAmount: 10000,
      currency: 'EUR',
      notes: 'Test order',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockWorkshopRepo.findById.mockResolvedValue({
      id: 'workshop-123',
    })

    mockRepo.create.mockResolvedValue(expectedOrder)

    const result = await createOrder(input, {
      repo: mockRepo as unknown as OrderRepository,
      workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
      authenticatedUserId: 'user-123',
    })

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        workshopId: 'workshop-123',
        notes: 'Test order',
        totalAmount: 10000,
        type: 'PRODUCT_ORDER',
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: 'product-123',
            quantity: 2,
            priceAtOrder: 5000,
            currency: 'EUR',
          }),
        ]),
      })
    )

    expect(result.status).toBe(OrderStatus.PENDING)
  })

  it('debe rechazar si el usuario autenticado no es el dueño', async () => {
    const input: CreateOrderInput = {
      userId: 'user-123',
      workshopId: 'workshop-123',
      items: [{ quantity: 1, priceAtOrder: 5000 }],
    }

    mockWorkshopRepo.findById.mockResolvedValue({ id: 'workshop-123' })

    await expect(
      createOrder(input, {
        repo: mockRepo as unknown as OrderRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        authenticatedUserId: 'different-user',
      })
    ).rejects.toThrow(
      'No tienes permisos para crear pedidos en nombre de otro usuario'
    )
  })

  it('debe rechazar si el pedido no tiene items', async () => {
    const input: CreateOrderInput = {
      userId: 'user-123',
      workshopId: 'workshop-123',
      items: [],
    }

    mockWorkshopRepo.findById.mockResolvedValue({ id: 'workshop-123' })

    await expect(
      createOrder(input, {
        repo: mockRepo as unknown as OrderRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        authenticatedUserId: 'user-123',
      })
    ).rejects.toThrow('El pedido debe tener al menos un item')
  })

  it('debe rechazar si un item tiene cantidad <= 0', async () => {
    const input: CreateOrderInput = {
      userId: 'user-123',
      workshopId: 'workshop-123',
      items: [{ quantity: 0, priceAtOrder: 5000 }],
    }

    mockWorkshopRepo.findById.mockResolvedValue({ id: 'workshop-123' })

    await expect(
      createOrder(input, {
        repo: mockRepo as unknown as OrderRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        authenticatedUserId: 'user-123',
      })
    ).rejects.toThrow('La cantidad de cada item debe ser mayor a 0')
  })

  it('debe rechazar si un item tiene precio <= 0', async () => {
    const input: CreateOrderInput = {
      userId: 'user-123',
      workshopId: 'workshop-123',
      items: [{ quantity: 1, priceAtOrder: 0 }],
    }

    mockWorkshopRepo.findById.mockResolvedValue({ id: 'workshop-123' })

    await expect(
      createOrder(input, {
        repo: mockRepo as unknown as OrderRepository,
        workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
        authenticatedUserId: 'user-123',
      })
    ).rejects.toThrow('El precio de cada item debe ser mayor a 0')
  })

  it('debe agregar moneda EUR por defecto a los items', async () => {
    const input: CreateOrderInput = {
      userId: 'user-123',
      workshopId: 'workshop-123',
      items: [{ productId: 'product-123', quantity: 1, priceAtOrder: 5000 }],
    }

    mockWorkshopRepo.findById.mockResolvedValue({ id: 'workshop-123' })

    mockRepo.create.mockResolvedValue({
      id: 'order-123',
      userId: 'user-123',
      workshopId: 'workshop-123',
      status: OrderStatus.PENDING,
      totalAmount: 5000,
      currency: 'EUR',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await createOrder(input, {
      repo: mockRepo as unknown as OrderRepository,
      workshopRepo: mockWorkshopRepo as unknown as WorkshopRepository,
      authenticatedUserId: 'user-123',
    })

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            currency: 'EUR',
          }),
        ]),
      })
    )
  })
})
