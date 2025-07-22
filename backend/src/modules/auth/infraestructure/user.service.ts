import bcrypt from 'bcrypt';

interface User {
  email: string;
  passwordHash: string;
}

const users: User[] = [];

// Simula guardado de usuario (usado en /register)
export const saveUser = async (email: string, password: string) => {
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ email, passwordHash });
  return { email };
};

// Simula búsqueda y validación (usado en /login)
export const findUserByEmail = (email: string) => {
  return users.find((user) => user.email === email);
};

export const validatePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
