import { saveUser } from '../infraestructure/services/user.service';

export const registerUserUseCase = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  await saveUser(email, password);
  return { email };
};
