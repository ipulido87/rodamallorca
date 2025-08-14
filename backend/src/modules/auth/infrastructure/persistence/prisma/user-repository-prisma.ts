import { PrismaClient } from '@prisma/client'
import {
  UserDTO,
  UserRepository,
} from '../../../domain/repositories/user-repository'

const prisma = new PrismaClient()

export class UserRepositoryPrisma implements UserRepository {
  async findByEmail(email: string): Promise<UserDTO | null> {
    const u = await prisma.user.findUnique({ where: { email } })
    return u
      ? {
          id: u.id,
          email: u.email,
          name: u.name,
          picture: u.picture,
          googleId: u.googleId,
        }
      : null
  }

  async upsertGoogleUser(input: {
    email: string
    googleId: string
    name?: string | null
    picture?: string | null
  }): Promise<UserDTO> {
    const u = await prisma.user.upsert({
      where: { email: input.email },
      update: {
        googleId: input.googleId,
        name: input.name ?? null,
        picture: input.picture ?? null,
      },
      create: {
        email: input.email,
        googleId: input.googleId,
        name: input.name ?? null,
        picture: input.picture ?? null,
      },
    })
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      picture: u.picture,
      googleId: u.googleId,
    }
  }
}
