import { Router } from 'express';
import { createMemory, getMemoriesByRelationship } from '../controllers/memoryController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/', authMiddleware, createMemory);
router.get('/:relId', authMiddleware, getMemoriesByRelationship);

export default router;
