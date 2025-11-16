import { Router } from 'express';
import { profileController } from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protected routes with specific paths
router.get('/user', authMiddleware, profileController.getUserProfile);
router.put('/user', authMiddleware, profileController.updateUserProfile);

// Public routes
router.get('/', profileController.getAllProfiles);

// Protected routes with parameters
router.post('/', authMiddleware, profileController.createProfile);
router.get('/:id', profileController.getProfile);
router.put('/:id', authMiddleware, profileController.updateProfile);
router.delete('/:id', authMiddleware, profileController.deleteProfile);

export default router; 