import { Router } from 'express';
import { LoginUserSchema } from '../../domain/schemas/login.schema';
import { RegisterUserSchema } from '../../domain/schemas/register.schema';
import { loginUserController, registerUser, verifyUser } from '../../interfaces/controllers/auth.controller';
import { verifyToken } from '../../interfaces/middlewares/auth.middleware';
import { validateBody } from '../../interfaces/middlewares/validateBody';


const router = Router();

router.post('/register', validateBody(RegisterUserSchema), registerUser);
router.post('/login', validateBody(LoginUserSchema), loginUserController);

router.get('/protected', verifyToken, (req, res) => {
  console.log('Usuario logueado:', req.user); 
  res.json({ message: 'Todo ok', user: req.user });
});
router.get('/verify', verifyUser); // 


export default router;
