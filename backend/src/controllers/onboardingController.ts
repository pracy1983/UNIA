import { Request, Response } from 'express';
import { query } from '../config/database.js';

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await query('SELECT * FROM quiz_questions WHERE active = TRUE');
    res.json(questions.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar perguntas' });
  }
};

export const saveAnswer = async (req: Request, res: Response) => {
  const { questionId, answerContent } = req.body;
  const userId = (req as any).user.id;

  try {
    await query(
      'INSERT INTO quiz_answers (user_id, question_id, answer_content) VALUES ($1, $2, $3) ON CONFLICT (user_id, question_id) DO UPDATE SET answer_content = $3',
      [userId, questionId, answerContent]
    );
    res.json({ message: 'Resposta salva com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar resposta' });
  }
};
