import bcrypt from 'bcrypt';
import { loginUser } from '../../modules/auth/application/login-user';
import type { UserRepository } from '../../modules/auth/domain/repositories/user-repository';
import type { TokenService } from '../../modules/auth/domain/services/token-service';

jest.mock('bcrypt');

describe('Login User Use Case', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    picture: null,
    googleId: null,
    role: 'USER',
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    birthDate: null,
    phone: null,
    verificationCode: null,
    codeExpiresAt: null,
    resetToken: null,
    resetTokenExpiresAt: null,
  };

  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockTokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepo = {
      findByEmail: jest.fn(),
      findByEmailWithCredentials: jest.fn(),
      create: jest.fn(),
      upsertGoogleUser: jest.fn(),
    } as any;

    mockTokenService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;
  });

  describe('loginUser', () => {
    it('should login successfully with valid credentials', async () => {
      const mockToken = 'mock.jwt.token';

      mockUserRepo.findByEmailWithCredentials.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockTokenService.sign.mockReturnValue(mockToken);

      const result = await loginUser('test@example.com', 'password123', {
        userRepo: mockUserRepo,
        tokenService: mockTokenService,
      });

      expect(mockUserRepo.findByEmailWithCredentials).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(mockTokenService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result.token).toBe(mockToken);
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect((result.user as any).password).toBeUndefined();
    });

    it('should normalize email to lowercase', async () => {
      mockUserRepo.findByEmailWithCredentials.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockTokenService.sign.mockReturnValue('token');

      await loginUser('TEST@EXAMPLE.COM', 'password123', {
        userRepo: mockUserRepo,
        tokenService: mockTokenService,
      });

      expect(mockUserRepo.findByEmailWithCredentials).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw error if user not found', async () => {
      mockUserRepo.findByEmailWithCredentials.mockResolvedValue(null);

      await expect(
        loginUser('notfound@example.com', 'password123', {
          userRepo: mockUserRepo,
          tokenService: mockTokenService,
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not verified', async () => {
      mockUserRepo.findByEmailWithCredentials.mockResolvedValue({ ...mockUser, verified: false });

      await expect(
        loginUser('test@example.com', 'password123', {
          userRepo: mockUserRepo,
          tokenService: mockTokenService,
        })
      ).rejects.toThrow('User not verified');
    });

    it('should throw error if user has no password (OAuth user)', async () => {
      mockUserRepo.findByEmailWithCredentials.mockResolvedValue({ ...mockUser, password: null });

      await expect(
        loginUser('test@example.com', 'password123', {
          userRepo: mockUserRepo,
          tokenService: mockTokenService,
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is invalid', async () => {
      mockUserRepo.findByEmailWithCredentials.mockResolvedValue(mockUser);
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
