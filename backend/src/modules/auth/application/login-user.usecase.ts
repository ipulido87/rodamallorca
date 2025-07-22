import { findUserByEmail, validatePassword } from '../infraestructure/user.service';
import { generateToken } from '../infraestructure/jwt.service';

export const loginUserUseCase = async (email: string, password: string) => {
  const user = findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const isValid = await validatePassword(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid credentials');

  const token = generateToken({ email: user.email });
  return { token };
};
