import { Router } from 'express';
import { registerUser, loginUser } from '../interfaces/auth.controller';
import { verifyToken } from '../interfaces/auth.middleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Ruta protegida de prueba
router.get('/protected', verifyToken, (req, res) => {
  console.log('Usuario logueado:', req.user); // Ya tiene tipado correcto
  res.json({ message: 'Todo ok', user: req.user });
});

export default router;
