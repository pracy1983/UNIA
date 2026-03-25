import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);

export default router;
