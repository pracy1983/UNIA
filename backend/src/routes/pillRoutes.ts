import { Router } from 'express';
import { createPill, getLatestPill, getRelationshipMemberPills } from '../controllers/pillController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/', authMiddleware, createPill);
router.get('/latest', authMiddleware, getLatestPill);
router.get('/relationship/:relId', authMiddleware, getRelationshipMemberPills);

export default router;
