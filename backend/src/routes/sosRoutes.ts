import { Router } from 'express';
import { triggerSOS } from '../controllers/sosController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/trigger', authMiddleware, triggerSOS);

export default router;
