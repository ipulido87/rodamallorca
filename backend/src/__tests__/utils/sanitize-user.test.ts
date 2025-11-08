import { sanitizeUser } from '../../utils/sanitize-user';

describe('Sanitize User Utility', () => {
  describe('sanitizeUser', () => {
    it('should remove sensitive fields from user object', () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        picture: 'https://example.com/picture.jpg',
        birthDate: new Date('1990-01-01'),
        phone: '+34612345678',
        verified: true,
        role: 'USER',
        verificationCode: 'secret-code',
        codeExpiresAt: new Date(),
        resetToken: 'reset-token',
        resetTokenExpiresAt: new Date(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const sanitized = sanitizeUser(user);

      expect(sanitized).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/picture.jpg',
        birthDate: user.birthDate,
        phone: '+34612345678',
        verified: true,
        role: 'USER',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      // Ensure sensitive fields are not present
      expect(sanitized).not.toHaveProperty('password');
      expect(sanitized).not.toHaveProperty('verificationCode');
      expect(sanitized).not.toHaveProperty('codeExpiresAt');
      expect(sanitized).not.toHaveProperty('resetToken');
      expect(sanitized).not.toHaveProperty('resetTokenExpiresAt');
    });

    it('should handle null optional fields', () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        picture: null,
        birthDate: null,
        phone: null,
        verified: false,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sanitized = sanitizeUser(user);

      expect(sanitized).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        picture: null,
        birthDate: null,
        phone: null,
        verified: false,
        role: 'USER',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should work with different user roles', () => {
      const roles = ['USER', 'WORKSHOP_OWNER', 'ADMIN'] as const;

      roles.forEach((role) => {
        const user = {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role,
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const sanitized = sanitizeUser(user);

        expect(sanitized.role).toBe(role);
      });
    });

    it('should handle undefined optional fields using nullish coalescing', () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        picture: undefined,
        birthDate: undefined,
        phone: undefined,
        verified: true,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sanitized = sanitizeUser(user);

      expect(sanitized.birthDate).toBeNull();
      expect(sanitized.phone).toBeNull();
    });
  });
});
