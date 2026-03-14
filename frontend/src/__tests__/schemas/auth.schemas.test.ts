import { describe, it, expect } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/shared/schemas/auth.schemas'

describe('Auth Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid email', () => {
      const result = emailSchema.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('should reject empty email', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El email es obligatorio')
      }
    })

    it('should reject invalid email format', () => {
      const result = emailSchema.safeParse('notanemail')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Debe ser un email válido')
      }
    })

    it('should reject email without domain', () => {
      const result = emailSchema.safeParse('test@')
      expect(result.success).toBe(false)
    })

    it('should accept email with subdomain', () => {
      const result = emailSchema.safeParse('test@mail.example.com')
      expect(result.success).toBe(true)
    })
  })

  describe('passwordSchema', () => {
    it('should accept valid password', () => {
      const result = passwordSchema.safeParse('password123')
      expect(result.success).toBe(true)
    })

    it('should reject empty password', () => {
      const result = passwordSchema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La contraseña es obligatoria'
        )
      }
    })

    it('should reject password shorter than 6 characters', () => {
      const result = passwordSchema.safeParse('12345')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La contraseña debe tener al menos 6 caracteres'
        )
      }
    })

    it('should accept password with exactly 6 characters', () => {
      const result = passwordSchema.safeParse('123456')
      expect(result.success).toBe(true)
    })
  })

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing email', () => {
      const result = loginSchema.safeParse({
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid email in login', () => {
      const result = loginSchema.safeParse({
        email: 'invalid',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject short password in login', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      name: 'Test User',
      role: 'USER' as const,
    }

    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse(validRegisterData)
      expect(result.success).toBe(true)
    })

    it('should reject when passwords do not match', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        confirmPassword: 'differentpassword',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find(
          (issue) => issue.path.includes('confirmPassword')
        )
        expect(confirmPasswordError?.message).toBe(
          'Las contraseñas no coinciden'
        )
      }
    })

    it('should reject name shorter than 2 characters', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        name: 'A',
      })
      expect(result.success).toBe(false)
    })

    it('should accept optional phone', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        phone: undefined,
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid phone number', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        phone: '+34 612 345 678',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid phone number', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        phone: 'not-a-phone',
      })
      expect(result.success).toBe(false)
    })

    it('should accept WORKSHOP_OWNER role', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        role: 'WORKSHOP_OWNER',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid role', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        role: 'INVALID_ROLE',
      })
      expect(result.success).toBe(false)
    })

    it('should default role to USER when not provided', () => {
      const { role, ...dataWithoutRole } = validRegisterData
      const result = registerSchema.safeParse(dataWithoutRole)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe('USER')
      }
    })
  })

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'test@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty email', () => {
      const result = forgotPasswordSchema.safeParse({ email: '' })
      expect(result.success).toBe(false)
    })

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'notvalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('should accept matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject non-matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'newpassword123',
        confirmPassword: 'different123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find(
          (issue) => issue.path.includes('confirmPassword')
        )
        expect(confirmPasswordError?.message).toBe(
          'Las contraseñas no coinciden'
        )
      }
    })

    it('should reject password shorter than 6 characters', () => {
      const result = resetPasswordSchema.safeParse({
        password: '12345',
        confirmPassword: '12345',
      })
      expect(result.success).toBe(false)
    })

    it('should reject password longer than 100 characters', () => {
      const longPassword = 'a'.repeat(101)
      const result = resetPasswordSchema.safeParse({
        password: longPassword,
        confirmPassword: longPassword,
      })
      expect(result.success).toBe(false)
    })
  })
})
