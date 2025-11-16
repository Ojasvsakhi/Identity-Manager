import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Profile } from '../entities/Profile';
import { User } from '../entities/User';
import { validate as uuidValidate } from 'uuid';

const profileRepository = AppDataSource.getRepository(Profile);
const userRepository = AppDataSource.getRepository(User);

export const profileController = {
  // Get all profiles
  async getAllProfiles(req: Request, res: Response) {
    try {
      const profiles = await profileRepository.find({
        relations: ['user']
      });
      res.json(profiles);
    } catch (error) {
      console.error('Get all profiles error:', error);
      res.status(500).json({ message: 'Error fetching profiles' });
    }
  },

  // Get user's own profile
  async getUserProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      if (!userId || !uuidValidate(userId)) {
        return res.status(401).json({ message: 'Invalid user ID' });
      }

      // First check if user exists
      const user = await userRepository.findOne({ 
        where: { id: userId },
        select: ['id', 'name', 'email', 'role']
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user already has a profile
      const existingProfile = await profileRepository.findOne({
        where: { userId, isUserProfile: true }
      });

      if (existingProfile) {
        return res.json(existingProfile);
      }

      // Create a new profile for the user
      const newProfile = profileRepository.create({
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.id,
        isUserProfile: true,
        isPublic: false,
        age: '',
        gender: 'Other',
        maritalStatus: 'Single',
        caste: 'General',
        education: '',
        occupation: '',
        location: '',
        contact: '',
        phoneNumber: '',
        website: '',
        socialLinks: '',
        skills: ''
      });

      const savedProfile = await profileRepository.save(newProfile);
      res.json(savedProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ 
        message: 'Error fetching profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update user profile
  async updateUserProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      if (!userId || !uuidValidate(userId)) {
        return res.status(401).json({ message: 'Invalid user ID' });
      }

      // First check if user exists
      const user = await userRepository.findOne({ 
        where: { id: userId },
        select: ['id', 'name', 'email', 'role']
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Find user's profile
      const profile = await profileRepository.findOne({
        where: { userId, isUserProfile: true }
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      const { 
        name, 
        email, 
        role, 
        bio, 
        location, 
        phoneNumber, 
        website, 
        socialLinks, 
        skills, 
        experience, 
        education,
        isPublic,
        age,
        gender,
        maritalStatus,
        caste,
        occupation,
        contact
      } = req.body;

      // Update profile
      profileRepository.merge(profile, {
        name,
        email,
        role,
        bio,
        location,
        phoneNumber,
        website,
        socialLinks,
        skills,
        experience,
        education,
        age,
        gender,
        maritalStatus,
        caste,
        occupation,
        contact,
        isPublic: isPublic !== undefined ? isPublic : profile.isPublic
      });

      const result = await profileRepository.save(profile);
      res.json(result);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ 
        message: 'Error updating profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get a specific profile by ID (only if public)
  async getProfileById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      if (!id || !uuidValidate(id)) {
        return res.status(400).json({ message: 'Invalid profile ID' });
      }

      const profile = await profileRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Allow access if:
      // 1. Profile is public, or
      // 2. User is viewing their own profile
      if (!profile.isPublic && profile.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  },

  // Get a specific public profile
  async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await profileRepository.findOne({
        where: { id, isPublic: true },
        relations: ['user']
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  },

  // Create new profile
  async createProfile(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const existingProfile = await profileRepository.findOne({
        where: { userId, isUserProfile: true }
      });

      if (existingProfile) {
        return res.status(400).json({ message: 'User already has a profile' });
      }

      const profileData = {
        ...req.body,
        isUserProfile: true
      };

      const profile = profileRepository.create(profileData);
      await profileRepository.save(profile);
      res.status(201).json(profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(500).json({ message: 'Error creating profile' });
    }
  },

  // Update profile
  async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isPublic, ...updateData } = req.body;

      const profile = await profileRepository.findOne({
        where: { id }
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      const updatedProfile = {
        ...profile,
        ...updateData,
        isPublic: isPublic !== undefined ? isPublic : profile.isPublic
      };

      await profileRepository.save(updatedProfile);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  },

  // Delete profile
  async deleteProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await profileRepository.findOne({
        where: { id }
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      await profileRepository.remove(profile);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting profile:', error);
      res.status(500).json({ message: 'Error deleting profile' });
    }
  },

  async getPublicProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await profileRepository.findOne({
        where: { id, isPublic: true }
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found or not public' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Error fetching public profile:', error);
      res.status(500).json({ message: 'Error fetching public profile' });
    }
  }
}; 