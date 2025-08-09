
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../../../lib/prisma';


export const saveUser = async (email: string, password: string) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const verificationCode = uuidv4();

  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      verificationCode,
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
