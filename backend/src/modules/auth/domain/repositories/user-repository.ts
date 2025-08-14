export interface UserDTO {
  id: string
  email: string
  name?: string | null
  picture?: string | null
  googleId?: string | null
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserDTO | null>
  upsertGoogleUser(input: {
    email: string
    googleId: string
    name?: string | null
    picture?: string | null
  }): Promise<UserDTO>
}
