import { createWorkshop } from '../../modules/workshops/application/create-workshop';
import { WorkshopRepository, WorkshopDTO } from '../../modules/workshops/domain/repositories/workshop-repository';

describe('Create Workshop Use Case', () => {
  let mockRepo: jest.Mocked<WorkshopRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOwnerId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };
  });

  const validInput = {
    name: 'Bike Shop Palma',
    description: 'Professional bike repair and sales',
    address: 'Calle Principal 123',
    city: 'Palma',
    country: 'Spain',
    phone: '+34971123456',
    ownerId: 'owner-1',
  };

  const mockWorkshop: WorkshopDTO = {
    id: 'workshop-1',
    ownerId: 'owner-1',
    name: 'Bike Shop Palma',
    description: 'Professional bike repair and sales',
    address: 'Calle Principal 123',
    city: 'Palma',
    country: 'Spain',
    phone: '+34971123456',
  };

  describe('createWorkshop', () => {
    it('should create workshop successfully', async () => {
      mockRepo.create.mockResolvedValue(mockWorkshop);

      const result = await createWorkshop(validInput, {
        repo: mockRepo,
        authenticatedUserId: 'owner-1',
      });

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...validInput,
        ownerId: 'owner-1',
      });
      expect(result).toEqual(mockWorkshop);
    });

    it('should override ownerId with authenticated user id', async () => {
      mockRepo.create.mockResolvedValue(mockWorkshop);

      await createWorkshop(
        { ...validInput, ownerId: 'different-owner' },
        {
          repo: mockRepo,
          authenticatedUserId: 'actual-owner',
        }
      );

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: 'actual-owner', // Should use authenticated user id
        })
      );
    });

    it('should throw error if name is empty', async () => {
      const invalidInput = { ...validInput, name: '' };

      await expect(
        createWorkshop(invalidInput, {
          repo: mockRepo,
          authenticatedUserId: 'owner-1',
        })
      ).rejects.toThrow('Workshop name required');

      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw error if name is only whitespace', async () => {
      const invalidInput = { ...validInput, name: '   ' };

      await expect(
        createWorkshop(invalidInput, {
          repo: mockRepo,
          authenticatedUserId: 'owner-1',
        })
      ).rejects.toThrow('Workshop name required');

      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should create workshop with minimal fields', async () => {
      const minimalInput = {
        name: 'Simple Workshop',
        ownerId: 'owner-1',
      };

      const minimalWorkshop: WorkshopDTO = {
        id: 'workshop-1',
        ownerId: 'owner-1',
        name: 'Simple Workshop',
        description: null,
        address: null,
        city: null,
        country: null,
        phone: null,
      };

      mockRepo.create.mockResolvedValue(minimalWorkshop);

      const result = await createWorkshop(minimalInput, {
        repo: mockRepo,
        authenticatedUserId: 'owner-1',
      });

      expect(mockRepo.create).toHaveBeenCalledWith({
        name: 'Simple Workshop',
        ownerId: 'owner-1',
      });
      expect(result).toEqual(minimalWorkshop);
    });

    it('should handle null optional fields', async () => {
      const inputWithNulls = {
        name: 'Workshop',
        description: null,
        address: null,
        city: null,
        country: null,
        phone: null,
        ownerId: 'owner-1',
      };

      mockRepo.create.mockResolvedValue({ ...mockWorkshop, ...inputWithNulls, id: 'workshop-1' });

      await createWorkshop(inputWithNulls, {
        repo: mockRepo,
        authenticatedUserId: 'owner-1',
      });

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...inputWithNulls,
        ownerId: 'owner-1',
      });
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      mockRepo.create.mockRejectedValue(error);

      await expect(
        createWorkshop(validInput, {
          repo: mockRepo,
          authenticatedUserId: 'owner-1',
        })
      ).rejects.toThrow('Database error');
    });
  });
});
