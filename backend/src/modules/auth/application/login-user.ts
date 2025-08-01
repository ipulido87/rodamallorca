import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/config';
import prisma from '../../../lib/prisma';
import { sanitizeUser } from '../../../utils/sanitize-user';

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: '1h',
  });

  return { token, user: sanitizeUser(user) };
};
