import { PrismaClient, UserRole } from '@prisma/client'
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
    // Buscar si existe por googleId O por email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: input.googleId }, { email: input.email }],
      },
    })

    // Si existe con googleId diferente pero mismo email
    if (
      existingUser &&
      existingUser.googleId &&
      existingUser.googleId !== input.googleId
    ) {
      throw new Error(
        'Este email ya está registrado con otra cuenta. Por favor inicia sesión con tus credenciales.'
      )
    }

    // Si existe sin googleId (registro tradicional), vincular la cuenta de Google
    if (existingUser && !existingUser.googleId) {
      // Si el rol solicitado es diferente, rechazar
      if (input.role && existingUser.role !== input.role) {
        throw new Error(
          `Este email ya está registrado como ${
            existingUser.role === UserRole.WORKSHOP_OWNER ? 'Taller' : 'Cliente'
          }. Por favor inicia sesión con tu contraseña.`
        )
      }

      // Vincular Google a la cuenta existente
      const u = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: input.googleId,
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

    // Si existe con el mismo googleId, validar rol
    if (existingUser && existingUser.googleId === input.googleId) {
      if (input.role && existingUser.role !== input.role) {
        throw new Error(
          `Esta cuenta de Google ya está registrada como ${
            existingUser.role === UserRole.WORKSHOP_OWNER ? 'Taller' : 'Cliente'
          }. Por favor usa otra cuenta de Google.`
        )
      }

      // Actualizar datos
      const u = await prisma.user.update({
        where: { googleId: input.googleId },
        data: {
          email: input.email,
          name: input.name ?? null,
          picture: input.picture ?? null,
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

    // Si no existe, crear nuevo
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
