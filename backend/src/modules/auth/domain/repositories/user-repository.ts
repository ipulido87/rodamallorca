export interface UserDTO {
  id: string
  email: string
  name?: string | null
  picture?: string | null
  googleId?: string | null
  role?: string | null
}

export interface UserWithCredentials {
  id: string
  email: string
  name: string | null
  picture: string | null
  googleId: string | null
  role: string | null
  password: string | null
  verified: boolean
  birthDate?: Date | null
  phone?: string | null
  createdAt?: Date
  updatedAt?: Date
  verificationCode?: string | null
  codeExpiresAt?: Date | null
  resetToken?: string | null
  resetTokenExpiresAt?: Date | null
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserDTO | null>
  findByEmailWithCredentials(email: string): Promise<UserWithCredentials | null>
  create(input: {
    email: string
    password: string
    name: string
    birthDate?: Date
    phone?: string
    role?: string
  }): Promise<UserDTO>
  upsertGoogleUser(input: {
    email: string
    googleId: string
    name?: string | null
    picture?: string | null
    role?: string
  }): Promise<UserDTO>
}
