import { Router } from 'express';
import { getActiveRelationships } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// Protected route with authentication
router.get('/relationships', authMiddleware, getActiveRelationships);

export default router;
