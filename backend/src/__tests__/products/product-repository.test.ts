import { ProductRepositoryPrisma } from '../../modules/products/infrastructure/persistence/prisma/product-repository-prisma';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    product: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('Product Repository Prisma', () => {
  let repository: ProductRepositoryPrisma;
  let prisma: any;

  beforeEach(() => {
    repository = new ProductRepositoryPrisma();
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('createDraft', () => {
    const input = {
      workshopId: 'workshop-1',
      title: 'Mountain Bike',
      price: 50000,
      currency: 'EUR',
      condition: 'used' as const,
      categoryId: 'category-1',
      description: 'Great bike',
    };

    const mockCreatedProduct = {
      id: 'product-1',
      workshopId: 'workshop-1',
      title: 'Mountain Bike',
      price: 50000,
      currency: 'EUR',
      status: 'DRAFT',
      condition: 'used',
      categoryId: 'category-1',
      description: 'Great bike',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a draft product with all fields', async () => {
      prisma.product.create.mockResolvedValue(mockCreatedProduct);

      const result = await repository.createDraft(input);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          workshopId: 'workshop-1',
          title: 'Mountain Bike',
          price: 50000,
          currency: 'EUR',
          condition: 'used',
          categoryId: 'category-1',
          description: 'Great bike',
          status: 'DRAFT',
        },
      });

      expect(result).toEqual({
        id: 'product-1',
        workshopId: 'workshop-1',
        title: 'Mountain Bike',
        price: 50000,
        currency: 'EUR',
        status: 'DRAFT',
        condition: 'used',
        categoryId: 'category-1',
      });
    });

    it('should use default values for optional fields', async () => {
      const minimalInput = {
        workshopId: 'workshop-1',
        title: 'Simple Product',
        price: 1000,
      };

      prisma.product.create.mockResolvedValue({
        ...mockCreatedProduct,
        title: 'Simple Product',
        price: 1000,
        currency: 'EUR',
        condition: 'used',
        categoryId: null,
        description: null,
      });

      await repository.createDraft(minimalInput);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          workshopId: 'workshop-1',
          title: 'Simple Product',
          price: 1000,
          currency: 'EUR', // default
          condition: 'used', // default
          categoryId: null,
          description: null,
          status: 'DRAFT',
        },
      });
    });
  });

  describe('publish', () => {
    it('should publish a product', async () => {
      prisma.product.updateMany.mockResolvedValue({ count: 1 });

      await repository.publish('product-1', 'workshop-1');

      expect(prisma.product.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
          workshopId: 'workshop-1',
        },
        data: { status: 'PUBLISHED' },
      });
    });

    it('should only allow workshop owner to publish their product', async () => {
      prisma.product.updateMany.mockResolvedValue({ count: 0 });

      await repository.publish('product-1', 'wrong-workshop');

      expect(prisma.product.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
          workshopId: 'wrong-workshop',
        },
        data: { status: 'PUBLISHED' },
      });
    });
  });

  describe('update', () => {
    const mockProduct = {
      id: 'product-1',
      workshopId: 'workshop-1',
      title: 'Updated Product',
      price: 60000,
      currency: 'EUR',
      status: 'DRAFT',
      condition: 'new',
      categoryId: 'category-2',
      description: 'Updated description',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update product successfully', async () => {
      prisma.product.updateMany.mockResolvedValue({ count: 1 });
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const patch = { title: 'Updated Product', price: 60000 };
      const result = await repository.update('product-1', 'workshop-1', patch);

      expect(prisma.product.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
          workshopId: 'workshop-1',
        },
        data: patch,
      });

      expect(result).toEqual({
        id: 'product-1',
        workshopId: 'workshop-1',
        title: 'Updated Product',
        price: 60000,
        currency: 'EUR',
        status: 'DRAFT',
        condition: 'new',
        categoryId: 'category-2',
      });
    });

    it('should throw error if product not found or not owned', async () => {
      prisma.product.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        repository.update('product-1', 'wrong-workshop', { title: 'Updated' })
      ).rejects.toThrow('Product not found or not owned by this workshop');
    });

    it('should throw error if product disappears after update', async () => {
      prisma.product.updateMany.mockResolvedValue({ count: 1 });
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        repository.update('product-1', 'workshop-1', { title: 'Updated' })
      ).rejects.toThrow('Product not found after update');
    });
  });

  describe('findById', () => {
    const mockProduct = {
      id: 'product-1',
      workshopId: 'workshop-1',
      title: 'Mountain Bike',
      price: 50000,
      currency: 'EUR',
      status: 'PUBLISHED',
      condition: 'used',
      categoryId: 'category-1',
      description: 'Great bike',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should find product by id', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await repository.findById('product-1');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });

      expect(result).toEqual({
        id: 'product-1',
        workshopId: 'workshop-1',
        title: 'Mountain Bike',
        price: 50000,
        currency: 'EUR',
        status: 'PUBLISHED',
        condition: 'used',
        categoryId: 'category-1',
      });
    });

    it('should return null if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    const mockProducts = [
      {
        id: 'product-1',
        workshopId: 'workshop-1',
        title: 'Mountain Bike',
        price: 50000,
        currency: 'EUR',
        status: 'PUBLISHED',
        condition: 'used',
        categoryId: 'category-1',
        description: 'Great bike',
        createdAt: new Date(),
        updatedAt: new Date(),
        workshop: { id: 'workshop-1', name: 'Bike Shop', city: 'Palma', country: 'Spain' },
        category: { id: 'category-1', name: 'Mountain Bikes' },
      },
    ];

    it('should search products with query', async () => {
      prisma.product.findMany.mockResolvedValue(mockProducts);
      prisma.product.count.mockResolvedValue(1);

      const result = await repository.search({ q: 'bike', page: 1, size: 12 });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
            title: {
              contains: 'bike',
              mode: 'insensitive',
            },
          }),
          skip: 0,
          take: 12,
          orderBy: { createdAt: 'desc' },
        })
      );

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by price range', async () => {
      prisma.product.findMany.mockResolvedValue(mockProducts);
      prisma.product.count.mockResolvedValue(1);

      await repository.search({ min: 10000, max: 100000 });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              gte: 10000,
              lte: 100000,
            },
          }),
        })
      );
    });

    it('should filter by category', async () => {
      prisma.product.findMany.mockResolvedValue(mockProducts);
      prisma.product.count.mockResolvedValue(1);

      await repository.search({ categoryId: 'category-1' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'category-1',
          }),
        })
      );
    });

    it('should filter by city', async () => {
      prisma.product.findMany.mockResolvedValue(mockProducts);
      prisma.product.count.mockResolvedValue(1);

      await repository.search({ city: 'Palma' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workshop: {
              city: {
                contains: 'Palma',
                mode: 'insensitive',
              },
            },
          }),
        })
      );
    });

    it('should handle pagination', async () => {
      prisma.product.findMany.mockResolvedValue(mockProducts);
      prisma.product.count.mockResolvedValue(50);

      await repository.search({ page: 3, size: 12 });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 24, // (3-1) * 12
          take: 12,
        })
      );
    });

    it('should limit max page size to 50', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await repository.search({ size: 100 });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50, // Max limit
        })
      );
    });

    it('should only return published products', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await repository.search({});

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
          }),
        })
      );
    });
  });
});
