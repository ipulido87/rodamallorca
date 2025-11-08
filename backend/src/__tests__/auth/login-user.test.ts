import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginUser } from '../../modules/auth/application/login-user';
import prisma from '../../lib/prisma';
import { sanitizeUser } from '../../utils/sanitize-user';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
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

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
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
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      (sanitizeUser as jest.Mock).mockReturnValue(mockSanitizedUser);

      const result = await loginUser('test@example.com', 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email },
        'test-secret',
        { expiresIn: '24h' }
      );
      expect(sanitizeUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        token: mockToken,
        user: mockSanitizedUser,
      });
    });

    it('should normalize email to lowercase', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');
      (sanitizeUser as jest.Mock).mockReturnValue({});

      await loginUser('TEST@EXAMPLE.COM', 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(loginUser('notfound@example.com', 'password123')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error if user not verified', async () => {
      const unverifiedUser = { ...mockUser, verified: false };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(unverifiedUser);

      await expect(loginUser('test@example.com', 'password123')).rejects.toThrow(
        'User not verified'
      );
    });

    it('should throw error if user has no password (OAuth user)', async () => {
      const oauthUser = { ...mockUser, password: null };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(oauthUser);

      await expect(loginUser('test@example.com', 'password123')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error if password is invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should use fallback secret if JWT_SECRET not set', async () => {
      delete process.env.JWT_SECRET;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');
      (sanitizeUser as jest.Mock).mockReturnValue({});

      await loginUser('test@example.com', 'password123');

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'fallback-secret',
        expect.any(Object)
      );
    });

    it('should create token with 24h expiration', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');
      (sanitizeUser as jest.Mock).mockReturnValue({});

      await loginUser('test@example.com', 'password123');

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        { expiresIn: '24h' }
      );
    });
  });
});
