import 'express'

declare global {
  namespace Express {
    interface UserPayload {
      id: string
      email: string
      role: 'USER' | 'WORKSHOP_OWNER' | 'ADMIN'
    }

    interface Request {
      user?: UserPayload
    }
  }
}
