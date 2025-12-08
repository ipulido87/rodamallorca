import { OrderStatus } from '@prisma/client'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { updateOrderStatus } from '../../modules/orders/application/update-order-status'
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

interface MockWorkshopRepository {
  findById: MockFunction
}

describe('updateOrderStatus', () => {
  let mockOrderRepo: MockOrderRepository
  let mockWorkshopRepo: MockWorkshopRepository

  beforeEach(() => {
    jest.clearAllMocks()

    mockOrderRepo = {
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

  it('debe actualizar el estado de un pedido correctamente', async () => {
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

    const mockWorkshop = {
      id: 'workshop-123',
      ownerId: 'owner-123',
    }

    const mockUpdatedOrder: Order = {
      ...mockOrder,
      status: OrderStatus.CONFIRMED,
    }

    mockOrderRepo.findById.mockResolvedValue(mockOrder)
    mockWorkshopRepo.findById.mockResolvedValue(mockWorkshop)
    mockOrderRepo.updateStatus.mockResolvedValue(mockUpdatedOrder)

    const result = await updateOrderStatus(
      'order-123',
      { status: OrderStatus.CONFIRMED },
      {
        repo: mockOrderRepo as unknown as OrderRepository,
        workshopRepo: mockWorkshopRepo as {
          findById: (
            id: string
          ) => Promise<{ id: string; ownerId: string } | null>
        },
        authenticatedUserId: 'owner-123',
        userRole: 'WORKSHOP_OWNER',
      }
    )

    expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('order-123', {
      status: OrderStatus.CONFIRMED,
    })

    expect(result.status).toBe(OrderStatus.CONFIRMED)
  })

  it('debe rechazar si el pedido no existe', async () => {
    mockOrderRepo.findById.mockResolvedValue(null)

    await expect(
      updateOrderStatus(
        'nonexistent-id',
        { status: OrderStatus.CONFIRMED },
        {
          repo: mockOrderRepo as unknown as OrderRepository,
          workshopRepo: mockWorkshopRepo as {
            findById: (
              id: string
            ) => Promise<{ id: string; ownerId: string } | null>
          },
          authenticatedUserId: 'owner-123',
          userRole: 'WORKSHOP_OWNER',
        }
      )
    ).rejects.toThrow('Pedido no encontrado')
  })

  it('debe rechazar si el taller no existe', async () => {
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

    mockOrderRepo.findById.mockResolvedValue(mockOrder)
    mockWorkshopRepo.findById.mockResolvedValue(null)

    await expect(
      updateOrderStatus(
        'order-123',
        { status: OrderStatus.CONFIRMED },
        {
          repo: mockOrderRepo as unknown as OrderRepository,
          workshopRepo: mockWorkshopRepo as {
            findById: (
              id: string
            ) => Promise<{ id: string; ownerId: string } | null>
          },
          authenticatedUserId: 'owner-123',
          userRole: 'WORKSHOP_OWNER',
        }
      )
    ).rejects.toThrow('Taller no encontrado')
  })

  it('debe rechazar si el usuario no es el dueño del taller', async () => {
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

    const mockWorkshop = {
      id: 'workshop-123',
      ownerId: 'owner-123',
    }

    mockOrderRepo.findById.mockResolvedValue(mockOrder)
    mockWorkshopRepo.findById.mockResolvedValue(mockWorkshop)

    await expect(
      updateOrderStatus(
        'order-123',
        { status: OrderStatus.CONFIRMED },
        {
          repo: mockOrderRepo as unknown as OrderRepository,
          workshopRepo: mockWorkshopRepo as {
            findById: (
              id: string
            ) => Promise<{ id: string; ownerId: string } | null>
          },
          authenticatedUserId: 'different-user',
          userRole: 'WORKSHOP_OWNER',
        }
      )
    ).rejects.toThrow('No tienes permisos para actualizar este pedido')
  })

  it('debe permitir a un admin actualizar el estado', async () => {
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

    const mockWorkshop = {
      id: 'workshop-123',
      ownerId: 'owner-123',
    }

    const mockUpdatedOrder: Order = {
      ...mockOrder,
      status: OrderStatus.CONFIRMED,
    }

    mockOrderRepo.findById.mockResolvedValue(mockOrder)
    mockWorkshopRepo.findById.mockResolvedValue(mockWorkshop)
    mockOrderRepo.updateStatus.mockResolvedValue(mockUpdatedOrder)

    const result = await updateOrderStatus(
      'order-123',
      { status: OrderStatus.CONFIRMED },
      {
        repo: mockOrderRepo as unknown as OrderRepository,
        workshopRepo: mockWorkshopRepo as {
          findById: (
            id: string
          ) => Promise<{ id: string; ownerId: string } | null>
        },
        authenticatedUserId: 'admin-123',
        userRole: 'ADMIN',
      }
    )

    expect(result.status).toBe(OrderStatus.CONFIRMED)
  })

  it('debe rechazar transiciones de estado inválidas', async () => {
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

    const mockWorkshop = {
      id: 'workshop-123',
      ownerId: 'owner-123',
    }

    mockOrderRepo.findById.mockResolvedValue(mockOrder)
    mockWorkshopRepo.findById.mockResolvedValue(mockWorkshop)

    await expect(
      updateOrderStatus(
        'order-123',
        { status: OrderStatus.PENDING },
        {
          repo: mockOrderRepo as unknown as OrderRepository,
          workshopRepo: mockWorkshopRepo as {
            findById: (
              id: string
            ) => Promise<{ id: string; ownerId: string } | null>
          },
          authenticatedUserId: 'owner-123',
          userRole: 'WORKSHOP_OWNER',
        }
      )
    ).rejects.toThrow(
      'No se puede modificar un pedido que ya está completado o cancelado'
    )
  })

  it('debe rechazar cambio de PENDING a READY (saltar estados)', async () => {
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

    const mockWorkshop = {
      id: 'workshop-123',
      ownerId: 'owner-123',
    }

    mockOrderRepo.findById.mockResolvedValue(mockOrder)
    mockWorkshopRepo.findById.mockResolvedValue(mockWorkshop)

    await expect(
      updateOrderStatus(
        'order-123',
        { status: OrderStatus.READY },
        {
          repo: mockOrderRepo as unknown as OrderRepository,
          workshopRepo: mockWorkshopRepo as {
            findById: (
              id: string
            ) => Promise<{ id: string; ownerId: string } | null>
          },
          authenticatedUserId: 'owner-123',
          userRole: 'WORKSHOP_OWNER',
        }
      )
    ).rejects.toThrow('No se puede cambiar de PENDING a READY')
  })
})
