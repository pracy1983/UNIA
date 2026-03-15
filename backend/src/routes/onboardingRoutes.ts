import { Router } from 'express';
import { getQuestions, saveAnswer } from '../controllers/onboardingController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/questions', authMiddleware, getQuestions);
router.post('/answer', authMiddleware, saveAnswer);

export default router;
