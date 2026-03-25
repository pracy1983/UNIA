import { Router } from 'express';
import { startMediation, sendMediationMessage } from '../controllers/sosController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/start', authMiddleware, startMediation);
router.post('/:sessionId/message', authMiddleware, sendMediationMessage);

export default router;
