import { Router } from 'express';
import { getActiveRelationships, getInsight } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// Protected route with authentication
router.get('/relationships', authMiddleware, getActiveRelationships);
router.get('/insight', authMiddleware, getInsight);

export default router;
