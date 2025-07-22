import { Request, Response } from 'express';
import { saveUser } from '../infraestructure/user.service'
import { findUserByEmail, validatePassword } from '../infraestructure/user.service';
import jwt from 'jsonwebtoken';

export const registerUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    await saveUser(email, password);
  
    return res.status(201).json({
      message: 'User registered successfully',
      user: { email }
    });
  };
  

  export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });
  
    const user = findUserByEmail(email);
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });
  
    const isValid = await validatePassword(password, user.passwordHash);
    if (!isValid)
      return res.status(401).json({ message: 'Invalid email or password' });
  
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
  
    res.status(200).json({ message: 'Login successful', token });
  };