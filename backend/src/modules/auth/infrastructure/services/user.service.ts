import { UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../../../../lib/prisma'

type SaveUserInput = {
  email: string
  password: string
  name: string
  birthDate?: Date
  phone?: string
  role?: UserRole
}

export const saveUser = async ({
  email,
  password,
  name,
  birthDate,
  phone,
  role,
}: SaveUserInput) => {
  const passwordHash = await bcrypt.hash(password, 10)
  const verificationCode = uuidv4()
  const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

  // normaliza email
  const emailNorm = email.trim().toLowerCase()

  return prisma.user.create({
    data: {
      email: emailNorm,
      password: passwordHash,
      name,
      birthDate: birthDate ?? null,
      phone: phone ?? null,
      role, // ← Sintaxis corta, equivale a role: role
      verificationCode,
      codeExpiresAt,
      verified: false,
    },
  })
}

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
}

export const validatePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}
