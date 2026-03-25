import { Router } from 'express';
import { getUnansweredQuestions, submitAnswer, getDiscoveries } from '../controllers/personalityController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/unanswered', authMiddleware, getUnansweredQuestions);
router.post('/answers', authMiddleware, submitAnswer);
router.get('/discoveries', authMiddleware, getDiscoveries);

export default router;
