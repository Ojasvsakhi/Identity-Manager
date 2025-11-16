import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/all', userController.getAllUsers); // DEBUG: get all users

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/settings', authMiddleware, userController.updateSettings);
router.put('/password', authMiddleware, userController.updatePassword);
router.delete('/account', authMiddleware, userController.deleteAccount);
router.post('/send-message', authMiddleware, userController.sendMessage);
router.get('/messages', authMiddleware, userController.getMessages);
router.post('/bookmark', authMiddleware, userController.bookmarkProfile);
router.get('/bookmarks', authMiddleware, userController.getBookmarkedProfiles);

export default router; 