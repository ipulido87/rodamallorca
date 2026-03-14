import { OrderStatus } from '../../modules/orders/domain/enums/order-status'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { Order } from '../../modules/orders/domain/entities/order'
import type { OrderRepository } from '../../modules/orders/domain/repositories/order-repository'
import type { BillingRepository } from '../../modules/billing/domain/repositories/billing-repository'

// Mock the email service to avoid @react-pdf/renderer issues
jest.mock('../../modules/notifications/services/email-service', () => ({
  sendInvoiceEmail: jest.fn(),
}))

// Mock the invoice generator to avoid issues
jest.mock('../../modules/billing/application/generate-invoice-from-order', () => ({
  generateInvoiceFromOrder: jest.fn(),
}))

import { updateOrderStatus } from '../../modules/orders/application/update-order-status'

type MockFunction = ReturnType<typeof jest.fn>

interface MockOrderRepository {
  create: MockFunction
  findById: MockFunction
  findByIdWithDetails: MockFunction
  findByUserId: MockFunction
  findByWorkshopId: MockFunction
  updateStatus: MockFunction
  findByStatus: MockFunction
  delete: MockFunction
}

interface MockWorkshopRepository {
  findById: MockFunction
}

interface MockBillingRepository {
  createCustomer: MockFunction
  findCustomerById: MockFunction
  findCustomersByWorkshop: MockFunction
  findCustomerByWorkshopAndEmail: MockFunction
  updateCustomer: MockFunction
  deleteCustomer: MockFunction
  createInvoiceSeries: MockFunction
  findInvoiceSeriesByWorkshop: MockFunction
  findDefaultSeriesByWorkshop: MockFunction
  getNextInvoiceNumber: MockFunction
  createInvoice: MockFunction
  findInvoiceById: MockFunction
  findInvoiceByIdWithDetails: MockFunction
  findInvoiceByOrderId: MockFunction
  findInvoicesByWorkshop: MockFunction
  updateInvoice: MockFunction
  deleteInvoice: MockFunction
}

describe('updateOrderStatus', () => {
  let mockOrderRepo: MockOrderRepository
  let mockWorkshopRepo: MockWorkshopRepository
  let mockBillingRepo: MockBillingRepository

  beforeEach(() => {
    jest.clearAllMocks()

    mockOrderRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithDetails: jest.fn(),
      findByUserId: jest.fn(),
      findByWorkshopId: jest.fn(),
      updateStatus: jest.fn(),
      findByStatus: jest.fn(),
      delete: jest.fn(),
    }

    mockWorkshopRepo = {
      findById: jest.fn(),
    }

    mockBillingRepo = {
      createCustomer: jest.fn(),
      findCustomerById: jest.fn(),
      findCustomersByWorkshop: jest.fn(),
      findCustomerByWorkshopAndEmail: jest.fn(),
      updateCustomer: jest.fn(),
      deleteCustomer: jest.fn(),
      createInvoiceSeries: jest.fn(),
      findInvoiceSeriesByWorkshop: jest.fn(),
      findDefaultSeriesByWorkshop: jest.fn(),
      getNextInvoiceNumber: jest.fn(),
      createInvoice: jest.fn(),
      findInvoiceById: jest.fn(),
      findInvoiceByIdWithDetails: jest.fn(),
      findInvoiceByOrderId: jest.fn(),
      findInvoicesByWorkshop: jest.fn(),
      updateInvoice: jest.fn(),
      deleteInvoice: jest.fn(),
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
        billingRepo: mockBillingRepo as unknown as BillingRepository,
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
          billingRepo: mockBillingRepo as unknown as BillingRepository,
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
          billingRepo: mockBillingRepo as unknown as BillingRepository,
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
          billingRepo: mockBillingRepo as unknown as BillingRepository,
          authenticatedUserId: 'different-user',
          userRole: 'WORKSHOP_OWNER',
        }
      )
    ).rejects.toThrow('No eres el propietario de este taller')
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
        billingRepo: mockBillingRepo as unknown as BillingRepository,
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
          billingRepo: mockBillingRepo as unknown as BillingRepository,
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
          billingRepo: mockBillingRepo as unknown as BillingRepository,
          authenticatedUserId: 'owner-123',
          userRole: 'WORKSHOP_OWNER',
        }
      )
    ).rejects.toThrow('No se puede cambiar de PENDING a READY')
  })
})
