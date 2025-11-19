import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import jwt from 'jsonwebtoken';
import { Message } from '../entities/Message';
import { Profile } from '../entities/Profile';
import { Bookmark } from '../entities/Bookmark';

const userRepository = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const userController = {
  // Register new user
  async register(req: Request, res: Response) {
    try {
      const { username, email, password, name } = req.body;
      console.log('Registration attempt:', { 
        username, 
        email, 
        passwordLength: password?.length,
        name 
      });

      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: [
          { email },
          { username }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user with default role
      const user = userRepository.create({
        username,
        email,
        password,
        name: name || username, // Use username as name if not provided
        role: 'user' // Set default role
      });

      console.log('User created before save:', {
        id: user.id,
        username: user.username,
        passwordLength: user.password?.length,
        isHashed: user.password?.startsWith('$2')
      });

      // Save user (password will be hashed by the BeforeInsert hook)
      await userRepository.save(user);

      console.log('User saved after hash:', {
        id: user.id,
        username: user.username,
        passwordLength: user.password?.length,
        isHashed: user.password?.startsWith('$2')
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: "User registered successfully",
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
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Error registering user",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log('Login attempt with:', { email, passwordLength: password?.length });

      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email and password are required',
          debug: { email: !!email, password: !!password }
        });
      }

      const user = await userRepository.findOne({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid credentials',
          debug: {
            emailFound: false,
            emailAttempted: email
          }
        });
      }
      console.log(user)
      const isValidPassword = await user.comparePassword(password);
      console.log('Password validation result:', isValidPassword);

      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Invalid credentials',
          debug: {
            emailFound: true,
            passwordValid: false,
            emailAttempted: email
          }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

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
      res.status(500).json({ 
        message: 'Error logging in',
        error: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  },

  // Get user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['profiles']
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          profiles: user.profiles
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        message: 'Error fetching user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async sendMessage(req: Request, res: Response) {
    try {
      const { recipientProfileId, content } = req.body;
      const senderId = (req as any).user?.id;
      if (!senderId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!recipientProfileId || !content) {
        return res.status(400).json({ message: 'Missing recipientProfileId or content' });
      }
      const profileRepo = req.app.get('dataSource').getRepository(Profile);
      const recipientProfile = await profileRepo.findOne({ where: { id: recipientProfileId } });
      if (!recipientProfile) {
        return res.status(404).json({ message: 'Recipient profile not found' });
      }
      const messageRepo = req.app.get('dataSource').getRepository(Message);
      const message = messageRepo.create({
        content,
        senderId,
        recipientProfileId,
      });
      await messageRepo.save(message);
      return res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json({ message: 'Failed to send message' });
    }
  },

  async getMessages(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const messageRepo = req.app.get('dataSource').getRepository(Message);
      const messages = await messageRepo.find({
        where: [
          { senderId: userId },
          { recipientProfile: { userId: userId } }
        ],
        relations: ['sender', 'recipientProfile'],
        order: { createdAt: 'DESC' }
      });
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
  },

  async bookmarkProfile(req: Request, res: Response) {
    try {
      const { profileId } = req.body;
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!profileId) {
        return res.status(400).json({ message: 'Missing profileId' });
      }
      const profileRepo = req.app.get('dataSource').getRepository(Profile);
      const profile = await profileRepo.findOne({ where: { id: profileId } });
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      const bookmarkRepo = req.app.get('dataSource').getRepository(Bookmark);
      const existingBookmark = await bookmarkRepo.findOne({ where: { userId, profileId } });
      if (existingBookmark) {
        return res.status(400).json({ message: 'Profile already bookmarked' });
      }
      const bookmark = bookmarkRepo.create({
        userId,
        profileId,
      });
      await bookmarkRepo.save(bookmark);
      return res.status(201).json({ message: 'Profile bookmarked successfully' });
    } catch (error) {
      console.error('Bookmark profile error:', error);
      return res.status(500).json({ message: 'Failed to bookmark profile' });
    }
  },

  async getBookmarkedProfiles(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const bookmarkRepo = req.app.get('dataSource').getRepository(Bookmark);
      const bookmarks = await bookmarkRepo.find({
        where: { userId },
        relations: ['profile'],
        order: { createdAt: 'DESC' }
      });
      return res.status(200).json(bookmarks.map((bookmark: any) => bookmark.profile));
    } catch (error) {
      console.error('Get bookmarked profiles error:', error);
      return res.status(500).json({ message: 'Failed to fetch bookmarked profiles' });
    }
  },

  // Update user password
  async updatePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      const user = await userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await userRepository.save(user);

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ 
        message: 'Error updating password',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete user account
  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: 'Password is required for account deletion' });
      }

      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['profiles']
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Password is incorrect' });
      }

      // Delete all associated profiles first
      if (user.profiles) {
        await Promise.all(user.profiles.map(profile => 
          AppDataSource.getRepository(Profile).remove(profile)
        ));
      }

      // Delete all associated messages
      await AppDataSource.getRepository(Message).delete({ senderId: userId });

      // Delete all associated bookmarks
      await AppDataSource.getRepository(Bookmark).delete({ userId });

      // Finally delete the user
      await userRepository.remove(user);

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ 
        message: 'Error deleting account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update user settings
  async updateSettings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, email, username } = req.body;

      const user = await userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await userRepository.findOne({
          where: { email }
        });
        if (existingUser) {
          return res.status(400).json({ message: 'Email is already taken' });
        }
      }

      if (username && username !== user.username) {
        const existingUserWithUsername = await userRepository.findOne({
          where: { username }
        });
        if (existingUserWithUsername) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }

      // Update user fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (username) user.username = username;

      await userRepository.save(user);

      res.json({
        message: 'Settings updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ 
        message: 'Error updating settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get all users (for debugging, no passwords)
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.find({
        select: ['id', 'username', 'email', 'name', 'role', 'createdAt', 'updatedAt']
      });
      res.json(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  async requestAccess(req: Request, res: Response) {
    try {
      const { profileId } = req.body;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      if (!profileId) {
        return res.status(400).json({ message: 'Missing profileId' });
      }

      const profileRepo = req.app.get('dataSource').getRepository(Profile);
      const profile = await profileRepo.findOne({ where: { id: profileId } });
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Send a message to the profile owner requesting access
      const messageRepo = req.app.get('dataSource').getRepository(Message);
      const message = messageRepo.create({
        content: `Access request: I would like to view your profile`,
        senderId: userId,
        recipientProfileId: profileId,
      });
      
      await messageRepo.save(message);
      return res.status(201).json({ message: 'Access request sent successfully' });
    } catch (error) {
      console.error('Request access error:', error);
      return res.status(500).json({ message: 'Failed to send access request' });
    }
  }
};