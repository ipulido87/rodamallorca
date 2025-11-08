import bcrypt from 'bcrypt';
import { saveUser, findUserByEmail, validatePassword } from '../../modules/auth/infrastructure/services/user.service';
import prisma from '../../lib/prisma';

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock('bcrypt');

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-1234'),
}));

describe('User Service', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.Date, 'now').mockReturnValue(mockDate.getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveUser', () => {
    const mockUserInput = {
      email: 'Test@Example.com  ',
      password: 'password123',
      name: 'Test User',
      birthDate: new Date('1990-01-01'),
      phone: '+34612345678',
      role: 'USER' as const,
    };

    it('should create a user with hashed password', async () => {
      const hashedPassword = 'hashed_password_123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockCreatedUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        name: mockUserInput.name,
        verified: false,
        verificationCode: 'mocked-uuid-1234',
        codeExpiresAt: new Date(mockDate.getTime() + 10 * 60 * 1000),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await saveUser(mockUserInput);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com', // Should be normalized
          password: hashedPassword,
          name: mockUserInput.name,
          birthDate: mockUserInput.birthDate,
          phone: mockUserInput.phone,
          role: mockUserInput.role,
          verificationCode: 'mocked-uuid-1234',
          codeExpiresAt: new Date(mockDate.getTime() + 10 * 60 * 1000),
          verified: false,
        },
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should normalize email to lowercase and trim spaces', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockResolvedValue({});

      await saveUser(mockUserInput);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
          }),
        })
      );
    });

    it('should set verification code expiration to 10 minutes', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockResolvedValue({});

      await saveUser(mockUserInput);

      const expectedExpiration = new Date(mockDate.getTime() + 10 * 60 * 1000);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            codeExpiresAt: expectedExpiration,
          }),
        })
      );
    });

    it('should handle optional fields as null', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockResolvedValue({});

      const minimalInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await saveUser(minimalInput);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            birthDate: null,
            phone: null,
          }),
        })
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by normalized email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await findUserByEmail('  Test@Example.COM  ');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findUserByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await validatePassword('password123', 'hashed_password');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await validatePassword('wrongpassword', 'hashed_password');

      expect(result).toBe(false);
    });
  });
});
