import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { WorkshopRepositoryPrisma } from '../../modules/workshops/infrastructure/persistence/prisma/workshop-repository-prisma'
import { PrismaClient } from '@prisma/client'

type MockFunction = ReturnType<typeof jest.fn>

interface MockPrismaClient {
  workshop: {
    create: MockFunction
    findUnique: MockFunction
    findMany: MockFunction
    update: MockFunction
    delete: MockFunction
  }
}

// ✅ Mock simple del PrismaClient (sin tipos genéricos locos)
jest.mock('@prisma/client', () => {
  const mockPrismaClient: MockPrismaClient = {
    workshop: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

describe('WorkshopRepositoryPrisma', () => {
  let repository: WorkshopRepositoryPrisma
  let prisma: MockPrismaClient

  const getPrismaMock = (): MockPrismaClient => {
    const PrismaClientMock = PrismaClient as unknown as jest.Mock
    const last =
      PrismaClientMock.mock.results[PrismaClientMock.mock.results.length - 1]
    return last?.value as MockPrismaClient
  }

  const mockWorkshop = {
    id: 'workshop-1',
    ownerId: 'owner-1',
    name: 'Bike Shop Palma',
    description: 'Professional bike repair',
    address: 'Calle Principal 123',
    city: 'Palma',
    country: 'Spain',
    phone: '+34971123456',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // ✅ El repo crea el PrismaClient dentro
    repository = new WorkshopRepositoryPrisma()

    // ✅ Capturamos el objeto mock que devolvió el constructor mockeado
    prisma = getPrismaMock()
  })

  describe('create', () => {
    it('should create a workshop', async () => {
      prisma.workshop.create.mockResolvedValue(mockWorkshop)

      const input = {
        ownerId: 'owner-1',
        name: 'Bike Shop Palma',
        description: 'Professional bike repair',
        address: 'Calle Principal 123',
        city: 'Palma',
        country: 'Spain',
        phone: '+34971123456',
      }

      const result = await repository.create(input as any)

      expect(prisma.workshop.create).toHaveBeenCalledWith({ data: input })
      expect(result).toEqual(mockWorkshop)
    })

    it('should create workshop with minimal fields', async () => {
      const minimalWorkshop = {
        id: 'workshop-1',
        ownerId: 'owner-1',
        name: 'Simple Workshop',
        description: null,
        address: null,
        city: null,
        country: null,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.workshop.create.mockResolvedValue(minimalWorkshop)

      const input = { ownerId: 'owner-1', name: 'Simple Workshop' }

      const result = await repository.create(input as any)

      expect(prisma.workshop.create).toHaveBeenCalledWith({ data: input })
      expect(result.name).toBe('Simple Workshop')
      expect(result.ownerId).toBe('owner-1')
    })
  })

  describe('findById', () => {
    it('should find workshop by id', async () => {
      prisma.workshop.findUnique.mockResolvedValue(mockWorkshop)

      const result = await repository.findById('workshop-1')

      expect(prisma.workshop.findUnique).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
      })
      expect(result).toEqual(mockWorkshop)
    })

    it('should return null if workshop not found', async () => {
      prisma.workshop.findUnique.mockResolvedValue(null)

      const result = await repository.findById('non-existent')

      expect(prisma.workshop.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
      })
      expect(result).toBeNull()
    })
  })

  describe('findByOwnerId', () => {
    it('should find all workshops for owner', async () => {
      const workshops = [mockWorkshop, { ...mockWorkshop, id: 'workshop-2' }]
      prisma.workshop.findMany.mockResolvedValue(workshops)

      const result = await repository.findByOwnerId('owner-1')

      expect(prisma.workshop.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'owner-1' },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(workshops)
    })
  })

  describe('update', () => {
    it('should update workshop successfully', async () => {
      const updatedWorkshop = { ...mockWorkshop, name: 'Updated Workshop' }
      prisma.workshop.update.mockResolvedValue(updatedWorkshop)

      const result = await repository.update('workshop-1', {
        name: 'Updated Workshop',
      } as any)

      expect(prisma.workshop.update).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
        data: { name: 'Updated Workshop' },
      })
      expect(result).toEqual(updatedWorkshop)
    })

    it('should return null if update fails', async () => {
      prisma.workshop.update.mockRejectedValue(new Error('Not found'))

      const result = await repository.update('non-existent', {
        name: 'Updated',
      } as any)

      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete workshop successfully', async () => {
      prisma.workshop.delete.mockResolvedValue(mockWorkshop)

      const result = await repository.delete('workshop-1')

      expect(prisma.workshop.delete).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
      })
      expect(result).toBe(true)
    })

    it('should return false if delete fails', async () => {
      prisma.workshop.delete.mockRejectedValue(new Error('Not found'))

      const result = await repository.delete('non-existent')

      expect(result).toBe(false)
    })
  })

  describe('findAll', () => {
    it('should find all workshops', async () => {
      const workshops = [mockWorkshop, { ...mockWorkshop, id: 'workshop-2' }]
      prisma.workshop.findMany.mockResolvedValue(workshops)

      const result = await repository.findAll()

      expect(prisma.workshop.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(workshops)
    })
  })
})
