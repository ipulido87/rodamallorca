import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { Request, Response, NextFunction } from 'express'
import { verifyToken, requireRole } from '../auth.middleware'
import jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken')
jest.mock('../../../../../config/config', () => ({
  config: {
    jwtSecret: 'test-secret',
  },
}))

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let mockJson: ReturnType<typeof jest.fn>
  let mockStatus: ReturnType<typeof jest.fn>

  beforeEach(() => {
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })
    mockNext = jest.fn()

    mockRequest = {
      headers: {},
      cookies: {},
    }

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    }

    jest.clearAllMocks()
  })

  describe('verifyToken', () => {
    it('should call next() with valid Bearer token', () => {
      const mockPayload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      }

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      }

      jest.mocked(jwt.verify).mockReturnValue(mockPayload as any)

      verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
      expect(mockRequest.user).toEqual(mockPayload)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should call next() with valid cookie token', () => {
      const mockPayload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      }

      mockRequest.cookies = {
        auth_token: 'cookie-token',
      }

      jest.mocked(jwt.verify).mockReturnValue(mockPayload as any)

      verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(jwt.verify).toHaveBeenCalledWith('cookie-token', 'test-secret')
      expect(mockNext).toHaveBeenCalled()
    })

    it('should return 401 if no token provided', () => {
      verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Missing authentication token',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 403 if token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      }

      jest.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid or expired token',
      })
    })
  })

  describe('requireRole', () => {
    it('should allow access if user has required role', () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'owner@example.com',
        role: 'WORKSHOP_OWNER',
      }

      const middleware = requireRole('WORKSHOP_OWNER')
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockStatus).not.toHaveBeenCalled()
    })

    it('should deny access if user has different role', () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      }

      const middleware = requireRole('WORKSHOP_OWNER')
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockJson).toHaveBeenCalledWith({ message: 'Forbidden' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow if user has any of multiple required roles', () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'admin@example.com',
        role: 'ADMIN',
      }

      const middleware = requireRole('WORKSHOP_OWNER', 'ADMIN')
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })
  })
})
