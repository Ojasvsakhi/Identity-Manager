import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import jwt from 'jsonwebtoken';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { username, email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: [
          { email },
          { username }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user (password will be hashed by the BeforeInsert hook)
      const user = userRepository.create({
        username,
        email,
        password,
        name,
        role: 'user'
      });

      await userRepository.save(user);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Error registering user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      console.log('Login attempt with:', { email: req.body.email });
      
      const userRepository = AppDataSource.getRepository(User);
      const { email, password } = req.body;

      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }

      console.log('Looking for user with email:', email);
      // Find user
      const user = await userRepository.findOne({
        where: { email }
      });

      if (!user) {
        console.log('User not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('User found, checking password');
      // Check password using the model's method
      const validPassword = await user.comparePassword(password);
      console.log('Password validation result:', validPassword);
      
      if (!validPassword) {
        console.log('Invalid password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('Password valid, generating token');
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log('Login successful');
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      res.status(500).json({ 
        message: 'Error logging in',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 