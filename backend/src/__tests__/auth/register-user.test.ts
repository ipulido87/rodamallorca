import { registerUserUseCase, RegisterInput } from '../../modules/auth/application/register-user';
import type { UserRepository } from '../../modules/auth/domain/repositories/user-repository';

describe('Register User Use Case', () => {
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock UserRepository
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
  });

  describe('registerUserUseCase', () => {
    const mockUserInput: RegisterInput = {
      email: '  Test@Example.COM  ',
      password: 'password123',
      name: 'Test User',
      birthDate: new Date('1990-01-01'),
      phone: '+34612345678',
      role: 'USER',
    };

    const mockCreatedUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      verified: false,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register a user with normalized email', async () => {
      mockUserRepo.create.mockResolvedValue(mockCreatedUser);

      const result = await registerUserUseCase(mockUserInput, {
        userRepo: mockUserRepo,
      });

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        ...mockUserInput,
        email: 'test@example.com', // Should be normalized
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should trim and lowercase email', async () => {
      mockUserRepo.create.mockResolvedValue(mockCreatedUser);

      await registerUserUseCase(
        {
          email: '  UPPERCASE@EXAMPLE.COM  ',
          password: 'password123',
          name: 'Test User',
        },
        {
          userRepo: mockUserRepo,
        }
      );

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'uppercase@example.com',
        })
      );
    });

    it('should pass all user data to repository', async () => {
      mockUserRepo.create.mockResolvedValue(mockCreatedUser);

      await registerUserUseCase(mockUserInput, {
        userRepo: mockUserRepo,
      });

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        birthDate: mockUserInput.birthDate,
        phone: '+34612345678',
        role: 'USER',
      });
    });

    it('should handle optional fields', async () => {
      mockUserRepo.create.mockResolvedValue(mockCreatedUser);

      const minimalInput: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await registerUserUseCase(minimalInput, {
        userRepo: mockUserRepo,
      });

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    });
  });
});
