import {
  Prisma,
  PrismaClient,
  type $Enums, // 👈 para el tipo del enum
} from '@prisma/client'
import type {
  CreateOrderRepoInput,
  OrderRepository,
} from '../../../domain/repositories/order-repository'
import type { Order } from '../../../domain/entities/order'
import { OrderStatus as DomainOrderStatus } from '../../../domain/enums/order-status'

type PrismaOrderStatus = $Enums.OrderStatus
type PrismaOrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>
type PrismaOrderWithoutItems = Prisma.OrderGetPayload<{
  include: { items: false }
}>

const toPrismaStatus = (s: DomainOrderStatus): PrismaOrderStatus =>
  s as unknown as PrismaOrderStatus
const toDomainStatus = (s: PrismaOrderStatus): DomainOrderStatus =>
  s as unknown as DomainOrderStatus

export class OrderRepositoryPrisma implements OrderRepository {
  constructor(private prisma: PrismaClient = new PrismaClient()) {}

  async create(input: CreateOrderRepoInput): Promise<Order> {
    if (!input.userId) throw new Error('userId es obligatorio')

    const order = await this.prisma.order.create({
      data: {
        user: { connect: { id: input.userId } },
        workshop: { connect: { id: input.workshopId } },
        status: 'PENDING', // 👈 literal del enum de Prisma vale
        type: (input.type || 'PRODUCT_ORDER') as any, // Tipo de orden
        totalAmount: input.totalAmount,
        currency: 'EUR',
        notes: input.notes,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            priceAtOrder: i.priceAtOrder,
            currency: i.currency,
            description: i.description,
            // Campos de alquiler
            isRental: i.isRental ?? false,
            rentalStartDate: i.rentalStartDate ?? null,
            rentalEndDate: i.rentalEndDate ?? null,
            rentalDays: i.rentalDays ?? null,
            depositPaid: i.depositPaid ?? null,
          })),
        },
      },
      include: { items: true },
    })

    return this.mapToOrder(order)
  }

  async findById(id: string, includeItems = false): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: includeItems,
        workshop: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
    return order ? this.mapToOrder(order) : null
  }

  async findByUserId(userId: string, includeItems = false): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: includeItems },
      orderBy: { createdAt: 'asc' }, // o 'desc' según tu UI
    })
    return orders.map((o) => this.mapToOrder(o))
  }

  async findByWorkshopId(
    workshopId: string,
    includeItems = false
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { workshopId },
      include: { items: includeItems },
      orderBy: { createdAt: 'desc' },
    })
    return orders.map((o) => this.mapToOrder(o))
  }

  async updateStatus(
    id: string,
    input: { status: DomainOrderStatus }
  ): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: toPrismaStatus(input.status) },
      include: { items: true },
    })
    return this.mapToOrder(order)
  }

  async findByStatus(
    status: DomainOrderStatus,
    includeItems = false
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { status: toPrismaStatus(status) },
      include: { items: includeItems },
      orderBy: { createdAt: 'desc' },
    })
    return orders.map((o) => this.mapToOrder(o))
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } })
  }

  private mapToOrder(order: any): Order {
    return {
      id: order.id,
      userId: order.userId,
      workshopId: order.workshopId,
      status: toDomainStatus(order.status),
      totalAmount: order.totalAmount,
      currency: order.currency,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items:
        'items' in order && order.items
          ? order.items.map((item: any) => ({
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
      workshop:
        'workshop' in order && order.workshop
          ? {
              id: order.workshop.id,
              name: order.workshop.name,
              ownerId: order.workshop.ownerId,
            }
          : undefined,
      user:
        'user' in order && order.user
          ? {
              id: order.user.id,
              email: order.user.email,
            }
          : undefined,
    }
  }
}
