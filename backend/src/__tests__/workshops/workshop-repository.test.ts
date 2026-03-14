import { beforeEach, describe, expect, it, jest } from '@jest/globals'

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

const mockPrisma: MockPrismaClient = {
  workshop: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

// Mock lib/prisma instead of @prisma/client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}))

import { WorkshopRepositoryPrisma } from '../../modules/workshops/infrastructure/persistence/prisma/workshop-repository-prisma'

describe('WorkshopRepositoryPrisma', () => {
  let repository: WorkshopRepositoryPrisma

  const mockWorkshop = {
    id: 'workshop-1',
    ownerId: 'owner-1',
    name: 'Bike Shop Palma',
    description: 'Professional bike repair',
    address: 'Calle Principal 123',
    city: 'Palma',
    country: 'Spain',
    phone: '+34971123456',
    logoOriginal: null,
    logoMedium: null,
    logoThumbnail: null,
    stripeConnectedAccountId: null,
    stripeOnboardingComplete: false,
    averageRating: null,
    reviewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new WorkshopRepositoryPrisma()
  })

  describe('create', () => {
    it('should create a workshop', async () => {
      mockPrisma.workshop.create.mockResolvedValue(mockWorkshop)

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

      expect(mockPrisma.workshop.create).toHaveBeenCalledWith({ data: input })
      expect(result).toEqual(mockWorkshop)
    })
  })

  describe('findById', () => {
    it('should find a workshop by id', async () => {
      mockPrisma.workshop.findUnique.mockResolvedValue(mockWorkshop)

      const result = await repository.findById('workshop-1')

      expect(mockPrisma.workshop.findUnique).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
      })
      expect(result).toEqual(mockWorkshop)
    })

    it('should return null if workshop not found', async () => {
      mockPrisma.workshop.findUnique.mockResolvedValue(null)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findByOwnerId', () => {
    it('should find workshops by owner id', async () => {
      const workshops = [mockWorkshop]
      mockPrisma.workshop.findMany.mockResolvedValue(workshops)

      const result = await repository.findByOwnerId('owner-1')

      expect(mockPrisma.workshop.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'owner-1' },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(workshops)
    })
  })

  describe('update', () => {
    it('should update a workshop', async () => {
      const updatedWorkshop = { ...mockWorkshop, name: 'Updated Name' }
      mockPrisma.workshop.update.mockResolvedValue(updatedWorkshop)

      const result = await repository.update('workshop-1', { name: 'Updated Name' })

      expect(mockPrisma.workshop.update).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
        data: { name: 'Updated Name' },
      })
      expect(result).toEqual(updatedWorkshop)
    })

    it('should return null if update fails', async () => {
      mockPrisma.workshop.update.mockRejectedValue(new Error('Not found'))

      const result = await repository.update('non-existent', { name: 'Updated' })

      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete a workshop', async () => {
      mockPrisma.workshop.delete.mockResolvedValue(mockWorkshop)

      const result = await repository.delete('workshop-1')

      expect(mockPrisma.workshop.delete).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
      })
      expect(result).toBe(true)
    })

    it('should return false if delete fails', async () => {
      mockPrisma.workshop.delete.mockRejectedValue(new Error('Not found'))

      const result = await repository.delete('non-existent')

      expect(result).toBe(false)
    })
  })

  describe('findAll', () => {
    it('should find all workshops', async () => {
      const workshops = [mockWorkshop, { ...mockWorkshop, id: 'workshop-2' }]
      mockPrisma.workshop.findMany.mockResolvedValue(workshops)

      const result = await repository.findAll()

      expect(mockPrisma.workshop.findMany).toHaveBeenCalled()
      expect(result).toEqual(workshops)
    })
  })
})
