import { OrderStatus, Prisma, PrismaClient } from '@prisma/client'
import type {
  CreateOrderInput,
  Order,
  UpdateOrderStatusInput,
} from '../../../domain/entities/order'
import type { OrderRepository } from '../../../domain/repositories/order-repository'

type PrismaOrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true }
}>

type PrismaOrderWithoutItems = Prisma.OrderGetPayload<{
  include: { items: false }
}>

export class OrderRepositoryPrisma implements OrderRepository {
  constructor(private prisma: PrismaClient = new PrismaClient()) {}

  async create(input: CreateOrderInput): Promise<Order> {
    // Calcular el total
    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0
    )

    const order = await this.prisma.order.create({
      data: {
        userId: input.userId,
        workshopId: input.workshopId,
        status: OrderStatus.PENDING,
        totalAmount,
        currency: 'EUR',
        notes: input.notes ?? null,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId ?? null,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
            currency: item.currency ?? 'EUR',
            description: item.description ?? null,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return this.mapToOrder(order)
  }

  async findById(id: string, includeItems = false): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: includeItems,
      },
    })

    if (!order) return null

    return this.mapToOrder(order)
  }

  async findByUserId(userId: string, includeItems = false): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: includeItems,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return orders.map((o) => this.mapToOrder(o))
  }

  async findByWorkshopId(
    workshopId: string,
    includeItems = false
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { workshopId },
      include: {
        items: includeItems,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return orders.map((o) => this.mapToOrder(o))
  }

  async updateStatus(
    id: string,
    input: UpdateOrderStatusInput
  ): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: input.status,
      },
      include: {
        items: true,
      },
    })

    return this.mapToOrder(order)
  }

  async findByStatus(
    status: OrderStatus,
    includeItems = false
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { status },
      include: {
        items: includeItems,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return orders.map((o) => this.mapToOrder(o))
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    })
  }

  private mapToOrder(
    order: PrismaOrderWithItems | PrismaOrderWithoutItems
  ): Order {
    return {
      id: order.id,
      userId: order.userId,
      workshopId: order.workshopId,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: 'items' in order && order.items
        ? order.items.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
            currency: item.currency,
            description: item.description,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }))
        : undefined,
    }
  }
}
