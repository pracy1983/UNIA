import { Router } from 'express';
import { getActiveRelationships } from '../controllers/dashboardController.js';
// import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Prepared for token authentication
// router.get('/relationships', authenticateToken, getActiveRelationships);
router.get('/relationships', getActiveRelationships);

export default router;
