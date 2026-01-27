export interface UserDTO {
  id: string
  email: string
  name?: string | null
  picture?: string | null
  googleId?: string | null
  role?: string | null
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserDTO | null>
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
