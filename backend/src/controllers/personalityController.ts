import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';

export const getUnansweredQuestions = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Fetch up to 3 active questions that the user hasn't answered yet
        const result = await query(
            `SELECT * FROM personality_questions 
             WHERE active = true 
             AND id NOT IN (SELECT question_id FROM personality_answers WHERE user_id = $1)
             ORDER BY random() 
             LIMIT 3`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const submitAnswer = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { questionId, answerContent } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await query(
            `INSERT INTO personality_answers (user_id, question_id, answer_content)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, question_id) 
             DO UPDATE SET answer_content = EXCLUDED.answer_content, created_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, questionId, answerContent]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDiscoveries = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Join answers with questions
        const result = await query(
            `SELECT q.id as question_id, q.question_text, q.category, a.answer_content, a.created_at
             FROM personality_answers a
             JOIN personality_questions q ON a.question_id = q.id
             WHERE a.user_id = $1
             ORDER BY a.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
