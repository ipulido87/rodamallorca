
import bcrypt from 'bcrypt';
import prisma from '../../../../lib/prisma';

export const saveUser = async (email: string, password: string) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const validatePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
