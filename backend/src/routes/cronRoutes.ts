import { Router, Request, Response } from 'express';
import { runDailyReminders } from '../services/reminderService.js';

const router = Router();

/**
 * Disparo manual da rotina de lembretes (para testes ou scheduler externo).
 * Protegido pelo header `x-cron-secret`, que deve bater com a env CRON_SECRET.
 */
router.post('/run-reminders', async (req: Request, res: Response) => {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return res.status(503).json({ message: 'CRON_SECRET não configurado no servidor.' });
  }
  if (req.headers['x-cron-secret'] !== secret) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const result = await runDailyReminders();
    res.json({ message: 'Lembretes executados.', ...result });
  } catch (err) {
    console.error('[Cron] Erro ao executar lembretes manualmente:', err);
    res.status(500).json({ message: 'Erro ao executar lembretes.' });
  }
});

export default router;
