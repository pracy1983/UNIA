import { Router } from 'express';
import { getProfile, updateProfile, updateSettings, deleteAccount } from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.patch('/settings', authMiddleware, updateSettings);
router.delete('/', authMiddleware, deleteAccount);

export default router;
