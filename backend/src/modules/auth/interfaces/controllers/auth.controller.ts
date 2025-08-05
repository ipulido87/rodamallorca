import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../../../../lib/prisma';
import { sanitizeUser } from '../../../../utils/sanitize-user';
import { loginUser } from '../../application/login-user';
import { RegisterUserSchema } from '../../domain/schemas/register.schema';
import { sendVerificationEmail } from '../../infraestructure/services/email-service';
import { saveUser } from '../../infraestructure/services/user.service';


export const registerUser = async (req: Request, res: Response) => {
  const result = RegisterUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  const { email, password } = result.data;

  try {
    const user = await saveUser(email, password);

     await sendVerificationEmail(user.email, user.verificationCode!);
    return res.status(201).json({
      message: 'User registered successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }
     console.error('[RegisterUser Error]', error);

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

export const verifyUser = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Código de verificación inválido' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationCode: code },
    });

    console.log('🟡 Usuario encontrado:', user);

    if (!user) {
      return res.status(404).json({ message: 'Código no encontrado o ya verificado' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: null,verified: true, },
    });

    console.log('🟢 Usuario actualizado:', updated);

    return res.status(200).json({ message: '✅ Usuario verificado correctamente' });
  } catch (error) {
    console.error('[VerifyUser Error]', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
