import { PrismaClient } from '@prisma/client'
import type { ServiceRepository } from '../../../domain/repositories/service-repository'
import type {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceCategory,
  VehicleType,
  ServiceStatus,
} from '../../../domain/entities/service'

const prisma = new PrismaClient()

export const serviceRepositoryPrisma: ServiceRepository = {
  async create(data: CreateServiceInput): Promise<Service> {
    const service = await prisma.service.create({
      data: {
        workshopId: data.workshopId,
        serviceCategoryId: data.serviceCategoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency || 'EUR',
        duration: data.duration,
        vehicleType: data.vehicleType || 'ALL',
        status: data.status || 'ACTIVE',
      },
      include: {
        serviceCategory: true,
      },
    })

    return service as Service
  },

  async findById(id: string): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        serviceCategory: true,
        workshop: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
    })

    return service as Service | null
  },

  async findByWorkshopId(workshopId: string): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: { workshopId },
      include: {
        serviceCategory: true,
      },
      orderBy: [
        { serviceCategory: { position: 'asc' } },
        { createdAt: 'desc' },
      ],
    })

    return services as Service[]
  },

  async findByCategory(categoryId: string): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: {
        serviceCategoryId: categoryId,
        status: 'ACTIVE',
      },
      include: {
        serviceCategory: true,
        workshop: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return services as Service[]
  },

  async findByVehicleType(vehicleType: VehicleType): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: {
        OR: [{ vehicleType }, { vehicleType: 'ALL' }],
        status: 'ACTIVE',
      },
      include: {
        serviceCategory: true,
        workshop: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return services as Service[]
  },

  async search(filters: {
    workshopId?: string
    serviceCategoryId?: string
    vehicleType?: VehicleType
    status?: ServiceStatus
    city?: string
  }): Promise<Service[]> {
    const where: any = {}

    if (filters.workshopId) {
      where.workshopId = filters.workshopId
    }

    if (filters.serviceCategoryId) {
      where.serviceCategoryId = filters.serviceCategoryId
    }

    if (filters.vehicleType) {
      where.OR = [
        { vehicleType: filters.vehicleType },
        { vehicleType: 'ALL' },
      ]
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.city) {
      where.workshop = {
        city: {
          contains: filters.city,
          mode: 'insensitive',
        },
      }
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        serviceCategory: true,
        workshop: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: [
        { serviceCategory: { position: 'asc' } },
        { createdAt: 'desc' },
      ],
    })

    return services as Service[]
  },

  async update(id: string, data: UpdateServiceInput): Promise<Service> {
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        duration: data.duration,
        vehicleType: data.vehicleType,
        status: data.status,
        serviceCategoryId: data.serviceCategoryId,
      },
      include: {
        serviceCategory: true,
      },
    })

    return service as Service
  },

  async delete(id: string): Promise<void> {
    await prisma.service.delete({
      where: { id },
    })
  },

  async findAllCategories(): Promise<ServiceCategory[]> {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { position: 'asc' },
    })

    return categories as ServiceCategory[]
  },

  async findCategoryById(id: string): Promise<ServiceCategory | null> {
    const category = await prisma.serviceCategory.findUnique({
      where: { id },
    })

    return category as ServiceCategory | null
  },
}
