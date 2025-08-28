import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface UserPayload extends JwtPayload {
      id: string
      email: string
      roles?: string[]
    }

    interface Request {
      user?: UserPayload
    }
  }
}

export {}
