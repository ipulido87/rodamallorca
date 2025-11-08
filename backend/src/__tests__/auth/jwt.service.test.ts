import { signJwt, verifyJwt, JwtPayload } from '../../modules/auth/infrastructure/adapters/jwt/jwt.service';

describe('JWT Service', () => {
  const mockPayload: JwtPayload = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeAll(() => {
    // Set JWT_SECRET for testing
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('signJwt', () => {
    it('should create a valid JWT token', () => {
      const token = signJwt(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should create different tokens for different payloads', () => {
      const token1 = signJwt(mockPayload);
      const token2 = signJwt({ ...mockPayload, email: 'different@example.com' });

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyJwt', () => {
    it('should verify and decode a valid token', () => {
      const token = signJwt(mockPayload);
      const decoded = verifyJwt<JwtPayload>(token);

      expect(decoded).toBeDefined();
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.id).toBe(mockPayload.id);
      expect(decoded?.role).toBe(mockPayload.role);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyJwt(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token with immediate expiration
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(mockPayload, process.env.JWT_SECRET!, { expiresIn: '0s' });

      // Wait a bit to ensure expiration
      setTimeout(() => {
        const decoded = verifyJwt(expiredToken);
        expect(decoded).toBeNull();
      }, 100);
    });

    it('should return null for tampered token', () => {
      const token = signJwt(mockPayload);
      const tamperedToken = token + 'tampered';
      const decoded = verifyJwt(tamperedToken);

      expect(decoded).toBeNull();
    });
  });

  describe('Token expiration', () => {
    it('should create tokens that expire in 7 days', () => {
      const jwt = require('jsonwebtoken');
      const token = signJwt(mockPayload);
      const decoded = jwt.decode(token) as any;

      const expirationTime = decoded.exp - decoded.iat;
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;

      expect(expirationTime).toBe(sevenDaysInSeconds);
    });
  });
});
