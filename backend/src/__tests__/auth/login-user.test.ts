import bcrypt from 'bcrypt';
import { loginUser } from '../../modules/auth/application/login-user';
import prisma from '../../lib/prisma';
import { sanitizeUser } from '../../utils/sanitize-user';
import type { UserRepository } from '../../modules/auth/domain/repositories/user-repository';
import type { TokenService } from '../../modules/auth/domain/services/token-service';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');
jest.mock('../../utils/sanitize-user');

describe('Login User Use Case', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    verified: true,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockTokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock UserRepository (aunque no se usa directamente en loginUser, está en deps)
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    // Mock TokenService
    mockTokenService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;
  });

  describe('loginUser', () => {
    it('should login successfully with valid credentials', async () => {
      const mockToken = 'mock.jwt.token';
      const mockSanitizedUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockTokenService.sign.mockReturnValue(mockToken);
      (sanitizeUser as jest.Mock).mockReturnValue(mockSanitizedUser);

      const result = await loginUser('test@example.com', 'password123', {
        userRepo: mockUserRepo,
        tokenService: mockTokenService,
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(mockTokenService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(sanitizeUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        token: mockToken,
        user: mockSanitizedUser,
      });
    });

    it('should normalize email to lowercase', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockTokenService.sign.mockReturnValue('token');
      (sanitizeUser as jest.Mock).mockReturnValue({});

      await loginUser('TEST@EXAMPLE.COM', 'password123', {
        userRepo: mockUserRepo,
        tokenService: mockTokenService,
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        loginUser('notfound@example.com', 'password123', {
          userRepo: mockUserRepo,
          tokenService: mockTokenService,
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not verified', async () => {
      const unverifiedUser = { ...mockUser, verified: false };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(unverifiedUser);

      await expect(
        loginUser('test@example.com', 'password123', {
          userRepo: mockUserRepo,
          tokenService: mockTokenService,
        })
      ).rejects.toThrow('User not verified');
    });

    it('should throw error if user has no password (OAuth user)', async () => {
      const oauthUser = { ...mockUser, password: null };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(oauthUser);

      await expect(
        loginUser('test@example.com', 'password123', {
          userRepo: mockUserRepo,
          tokenService: mockTokenService,
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        loginUser('test@example.com', 'wrongpassword', {
          userRepo: mockUserRepo,
          tokenService: mockTokenService,
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
