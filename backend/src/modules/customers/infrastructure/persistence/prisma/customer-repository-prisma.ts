// backend/src/modules/customers/infrastructure/persistence/prisma/customer-repository-prisma.ts
import prisma from '../../../../../lib/prisma'
import type { CustomerRepository } from '../../../domain/repositories/customer-repository'
import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from '../../../domain/entities/customer'

export const customerRepositoryPrisma: CustomerRepository = {
  async create(data: CreateCustomerInput): Promise<Customer> {
    const customer = await prisma.customer.create({
      data: {
        workshopId: data.workshopId,
        type: data.type,
        name: data.name,
        taxId: data.taxId,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country || 'España',
        notes: data.notes,
      },
    })

    return customer as Customer
  },

  async findById(id: string): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    })

    return customer as Customer | null
  },

  async findByWorkshop(workshopId: string): Promise<Customer[]> {
    const customers = await prisma.customer.findMany({
      where: { workshopId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    })

    return customers as Customer[]
  },

  async findByEmail(
    workshopId: string,
    email: string
  ): Promise<Customer | null> {
    const customer = await prisma.customer.findFirst({
      where: {
        workshopId,
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })

    return customer as Customer | null
  },

  async findByTaxId(
    workshopId: string,
    taxId: string
  ): Promise<Customer | null> {
    const customer = await prisma.customer.findFirst({
      where: {
        workshopId,
        taxId,
      },
    })

    return customer as Customer | null
  },

  async update(id: string, data: UpdateCustomerInput): Promise<Customer> {
    const customer = await prisma.customer.update({
      where: { id },
      data,
    })

    return customer as Customer
  },

  async delete(id: string): Promise<void> {
    await prisma.customer.delete({
      where: { id },
    })
  },
}
