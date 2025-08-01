import { User } from '@prisma/client';

export function sanitizeUser(user: User) {
  const { password: _, ...safeUser } = user;
  return safeUser;
}