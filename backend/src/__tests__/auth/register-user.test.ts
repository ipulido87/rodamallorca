import { registerUserUseCase, RegisterInput } from '../../modules/auth/application/register-user';
import * as userService from '../../modules/auth/infrastructure/services/user.service';

jest.mock('../../modules/auth/infrastructure/services/user.service');

describe('Register User Use Case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      password: 'hashed_password',
      verified: false,
      verificationCode: 'code-123',
      codeExpiresAt: new Date(),
      role: 'USER',
    };

    it('should register a user with normalized email', async () => {
      (userService.saveUser as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await registerUserUseCase(mockUserInput);

      expect(userService.saveUser).toHaveBeenCalledWith({
        ...mockUserInput,
        email: 'test@example.com', // Should be normalized
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should trim and lowercase email', async () => {
      (userService.saveUser as jest.Mock).mockResolvedValue(mockCreatedUser);

      await registerUserUseCase({
        email: '  UPPERCASE@EXAMPLE.COM  ',
        password: 'password123',
        name: 'Test User',
      });

      expect(userService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'uppercase@example.com',
        })
      );
    });

    it('should handle registration with minimal fields', async () => {
      (userService.saveUser as jest.Mock).mockResolvedValue(mockCreatedUser);

      const minimalInput: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await registerUserUseCase(minimalInput);

      expect(userService.saveUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    });

    it('should propagate errors from saveUser', async () => {
      const error = new Error('Email already exists');
      (userService.saveUser as jest.Mock).mockRejectedValue(error);

      await expect(registerUserUseCase(mockUserInput)).rejects.toThrow('Email already exists');
    });

    it('should handle WORKSHOP_OWNER role', async () => {
      (userService.saveUser as jest.Mock).mockResolvedValue({
        ...mockCreatedUser,
        role: 'WORKSHOP_OWNER',
      });

      const result = await registerUserUseCase({
        ...mockUserInput,
        role: 'WORKSHOP_OWNER',
      });

      expect(userService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'WORKSHOP_OWNER',
        })
      );
    });

    it('should handle ADMIN role', async () => {
      (userService.saveUser as jest.Mock).mockResolvedValue({
        ...mockCreatedUser,
        role: 'ADMIN',
      });

      const result = await registerUserUseCase({
        ...mockUserInput,
        role: 'ADMIN',
      });

      expect(userService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'ADMIN',
        })
      );
    });
  });
});
