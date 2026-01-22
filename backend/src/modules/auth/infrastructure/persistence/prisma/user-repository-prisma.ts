import { UserRole } from '@prisma/client'
import prisma from '../../../../../lib/prisma'
import {
  UserDTO,
  UserRepository,
} from '../../../domain/repositories/user-repository'

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
          role: u.role,
        }
      : null
  }

  async upsertGoogleUser(input: {
    email: string
    googleId: string
    name?: string | null
    picture?: string | null
    role?: string
  }): Promise<UserDTO> {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: input.googleId }, { email: input.email }],
      },
    })

    // Si existe, simplemente actualizar y hacer login (IGNORAR validación de rol)
    if (existingUser) {
      const u = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: existingUser.googleId || input.googleId,
          name: input.name ?? existingUser.name,
          picture: input.picture ?? existingUser.picture,
          verified: true,
        },
      })

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        picture: u.picture,
        googleId: u.googleId,
        role: u.role,
      }
    }

    // Si NO existe, crear nuevo
    const u = await prisma.user.create({
      data: {
        email: input.email,
        googleId: input.googleId,
        name: input.name ?? null,
        picture: input.picture ?? null,
        verified: true,
        role: (input.role as UserRole) || UserRole.USER,
      },
    })

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      picture: u.picture,
      googleId: u.googleId,
      role: u.role,
    }
  }
}
