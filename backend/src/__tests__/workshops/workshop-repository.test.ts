import { WorkshopRepositoryPrisma } from '../../modules/workshops/infrastructure/persistence/prisma/workshop-repository-prisma';
import { PrismaClient } from '@prisma/client';

type MockFunction = ReturnType<typeof jest.fn>;

interface MockPrismaClient {
  workshop: {
    create: MockFunction;
    findUnique: MockFunction;
    findMany: MockFunction;
    update: MockFunction;
    delete: MockFunction;
  };
}

jest.mock('@prisma/client', () => {
  const mockPrismaClient: MockPrismaClient = {
    workshop: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('Workshop Repository Prisma', () => {
  let repository: WorkshopRepositoryPrisma;
  let prisma: MockPrismaClient;

  beforeEach(() => {
    repository = new WorkshopRepositoryPrisma();
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

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
  };

  describe('create', () => {
    it('should create a workshop', async () => {
      prisma.workshop.create.mockResolvedValue(mockWorkshop);

      const input = {
        ownerId: 'owner-1',
        name: 'Bike Shop Palma',
        description: 'Professional bike repair',
        address: 'Calle Principal 123',
        city: 'Palma',
        country: 'Spain',
        phone: '+34971123456',
      };

      const result = await repository.create(input);

      expect(prisma.workshop.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockWorkshop);
    });

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
      };

      prisma.workshop.create.mockResolvedValue(minimalWorkshop);

      const input = {
        ownerId: 'owner-1',
        name: 'Simple Workshop',
      };

      const result = await repository.create(input);

      expect(result.name).toBe('Simple Workshop');
      expect(result.ownerId).toBe('owner-1');
    });
  });

  describe('findById', () => {
    it('should find workshop by id', async () => {
      prisma.workshop.findUnique.mockResolvedValue(mockWorkshop);

      const result = await repository.findById('workshop-1');

      expect(prisma.workshop.findUnique).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
      });
      expect(result).toEqual(mockWorkshop);
    });

    it('should return null if workshop not found', async () => {
      prisma.workshop.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByOwnerId', () => {
    it('should find all workshops for owner', async () => {
      const workshops = [mockWorkshop, { ...mockWorkshop, id: 'workshop-2' }];
      prisma.workshop.findMany.mockResolvedValue(workshops);

      const result = await repository.findByOwnerId('owner-1');

      expect(prisma.workshop.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'owner-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(workshops);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no workshops found', async () => {
      prisma.workshop.findMany.mockResolvedValue([]);

      const result = await repository.findByOwnerId('owner-with-no-workshops');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should order results by creation date descending', async () => {
      prisma.workshop.findMany.mockResolvedValue([]);

      await repository.findByOwnerId('owner-1');

      expect(prisma.workshop.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('update', () => {
    it('should update workshop successfully', async () => {
      const updatedWorkshop = { ...mockWorkshop, name: 'Updated Workshop' };
      prisma.workshop.update.mockResolvedValue(updatedWorkshop);

      const result = await repository.update('workshop-1', { name: 'Updated Workshop' });

      expect(prisma.workshop.update).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
        data: { name: 'Updated Workshop' },
      });
      expect(result).toEqual(updatedWorkshop);
    });

    it('should return null if update fails', async () => {
      prisma.workshop.update.mockRejectedValue(new Error('Not found'));

      const result = await repository.update('non-existent', { name: 'Updated' });

      expect(result).toBeNull();
    });

    it('should allow partial updates', async () => {
      prisma.workshop.update.mockResolvedValue(mockWorkshop);

      await repository.update('workshop-1', { city: 'Barcelona' });

      expect(prisma.workshop.update).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
        data: { city: 'Barcelona' },
      });
    });

    it('should not allow updating id or ownerId', async () => {
      const update = { name: 'Updated' };
      prisma.workshop.update.mockResolvedValue(mockWorkshop);

      await repository.update('workshop-1', update);

      expect(prisma.workshop.update).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
        data: update,
      });
    });
  });

  describe('delete', () => {
    it('should delete workshop successfully', async () => {
      prisma.workshop.delete.mockResolvedValue(mockWorkshop);

      const result = await repository.delete('workshop-1');

      expect(prisma.workshop.delete).toHaveBeenCalledWith({
        where: { id: 'workshop-1' },
      });
      expect(result).toBe(true);
    });

    it('should return false if delete fails', async () => {
      prisma.workshop.delete.mockRejectedValue(new Error('Not found'));

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should find all workshops', async () => {
      const workshops = [mockWorkshop, { ...mockWorkshop, id: 'workshop-2' }];
      prisma.workshop.findMany.mockResolvedValue(workshops);

      const result = await repository.findAll();

      expect(prisma.workshop.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(workshops);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no workshops exist', async () => {
      prisma.workshop.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should order results by creation date descending', async () => {
      prisma.workshop.findMany.mockResolvedValue([]);

      await repository.findAll();

      expect(prisma.workshop.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
