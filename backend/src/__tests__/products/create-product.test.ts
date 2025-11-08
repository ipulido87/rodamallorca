import { createProductDraft } from '../../modules/products/application/create-product';
import { ProductRepository, ProductDTO } from '../../modules/products/domain/repositories/product-repository';

describe('Create Product Use Case', () => {
  let mockRepo: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepo = {
      createDraft: jest.fn(),
      publish: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      search: jest.fn(),
    };
  });

  const validInput = {
    workshopId: 'workshop-1',
    title: 'Mountain Bike Trek',
    price: 50000, // 500 EUR in cents
    currency: 'EUR',
    condition: 'used' as const,
    categoryId: 'category-1',
    description: 'Great bike in excellent condition',
  };

  const mockProduct: ProductDTO = {
    id: 'product-1',
    workshopId: 'workshop-1',
    title: 'Mountain Bike Trek',
    price: 50000,
    currency: 'EUR',
    status: 'DRAFT',
    condition: 'used',
    categoryId: 'category-1',
  };

  describe('createProductDraft', () => {
    it('should create a product draft successfully', async () => {
      mockRepo.createDraft.mockResolvedValue(mockProduct);

      const result = await createProductDraft(validInput, { repo: mockRepo });

      expect(mockRepo.createDraft).toHaveBeenCalledWith(validInput);
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if title is empty', async () => {
      const invalidInput = { ...validInput, title: '' };

      await expect(createProductDraft(invalidInput, { repo: mockRepo })).rejects.toThrow(
        'Title required'
      );

      expect(mockRepo.createDraft).not.toHaveBeenCalled();
    });

    it('should throw error if title is only whitespace', async () => {
      const invalidInput = { ...validInput, title: '   ' };

      await expect(createProductDraft(invalidInput, { repo: mockRepo })).rejects.toThrow(
        'Title required'
      );

      expect(mockRepo.createDraft).not.toHaveBeenCalled();
    });

    it('should throw error if price is negative', async () => {
      const invalidInput = { ...validInput, price: -100 };

      await expect(createProductDraft(invalidInput, { repo: mockRepo })).rejects.toThrow(
        'Price must be >= 0'
      );

      expect(mockRepo.createDraft).not.toHaveBeenCalled();
    });

    it('should accept price of 0', async () => {
      const freeInput = { ...validInput, price: 0 };
      mockRepo.createDraft.mockResolvedValue({ ...mockProduct, price: 0 });

      const result = await createProductDraft(freeInput, { repo: mockRepo });

      expect(mockRepo.createDraft).toHaveBeenCalledWith(freeInput);
      expect(result.price).toBe(0);
    });

    it('should handle product with minimal fields', async () => {
      const minimalInput = {
        workshopId: 'workshop-1',
        title: 'Simple Product',
        price: 1000,
      };

      mockRepo.createDraft.mockResolvedValue({
        ...mockProduct,
        title: 'Simple Product',
        price: 1000,
        categoryId: null,
      });

      const result = await createProductDraft(minimalInput, { repo: mockRepo });

      expect(mockRepo.createDraft).toHaveBeenCalledWith(minimalInput);
      expect(result).toBeDefined();
    });

    it('should handle different product conditions', async () => {
      const conditions = ['new', 'used', 'refurb'] as const;

      for (const condition of conditions) {
        const input = { ...validInput, condition };
        mockRepo.createDraft.mockResolvedValue({ ...mockProduct, condition });

        const result = await createProductDraft(input, { repo: mockRepo });

        expect(result.condition).toBe(condition);
      }
    });

    it('should handle null categoryId', async () => {
      const input = { ...validInput, categoryId: null };
      mockRepo.createDraft.mockResolvedValue({ ...mockProduct, categoryId: null });

      const result = await createProductDraft(input, { repo: mockRepo });

      expect(mockRepo.createDraft).toHaveBeenCalledWith(input);
      expect(result.categoryId).toBeNull();
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      mockRepo.createDraft.mockRejectedValue(error);

      await expect(createProductDraft(validInput, { repo: mockRepo })).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
