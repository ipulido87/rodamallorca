export function sanitizeUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    picture: u.picture,
    birthDate: u.birthDate ?? null,
    phone: u.phone ?? null,
    verified: u.verified,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}
