interface UserWithSensitiveData {
  id: string
  email: string
  name: string
  picture?: string | null
  birthDate?: Date | null
  phone?: string | null
  verified: boolean
  role: string
  createdAt: Date
  updatedAt: Date
  password?: string
  verificationCode?: string
  codeExpiresAt?: Date
  resetToken?: string | null
  resetTokenExpiresAt?: Date | null
  googleId?: string | null
}

export function sanitizeUser(u: UserWithSensitiveData) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    picture: u.picture,
    birthDate: u.birthDate ?? null,
    phone: u.phone ?? null,
    verified: u.verified,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}
