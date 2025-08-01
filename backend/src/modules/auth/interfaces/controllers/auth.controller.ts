import { Request, Response } from 'express';
import { sanitizeUser } from '../../../../utils/sanitize-user';
import { loginUser } from '../../application/login-user';
import { RegisterUserSchema } from '../../domain/schemas/register.schema';
import { saveUser } from '../../infraestructure/services/user.service';

export const registerUser = async (req: Request, res: Response) => {
  const result = RegisterUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  const { email, password } = result.data;

  try {
    const user = await saveUser(email, password);

    return res.status(201).json({
      message: 'User registered successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUserController = async (req: Request, res: Response) => {
  const result = RegisterUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  const { email, password } = result.data;

  try {
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid email or password' });
  }
};
