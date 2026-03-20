import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';
import { deepseekService } from '../services/deepseekService.js';

/**
 * Trigger an SOS Event.
 * Provides immediate AI-guided emotional first aid.
 */
export const triggerSOS = async (req: AuthRequest, res: Response) => {
  const { relationshipId, message } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 1. Get some context about the relationship (optional but better)
    let contextStr = "Conflito não especificado.";
    if (relationshipId) {
       const relInfo = await query('SELECT title, type FROM relationships WHERE id = $1', [relationshipId]);
       if (relInfo.rowCount && relInfo.rowCount > 0) {
         contextStr = `Relacionamento: ${relInfo.rows[0].title} (${relInfo.rows[0].type})`;
       }
    }

    // 2. Call DeepSeek for Emergency Mediation
    const prompt = `
      EMERGÊNCIA EMOCIONAL: O usuário clicou no botão SOS da UNIA.
      Contexto: ${contextStr}
      Mensagem do Usuário: "${message || 'Sem detalhes, apenas em crise.'}"

      OBJETIVO: Fornecer 3 passos imediatos e práticos para acalmar os ânimos e evitar ações impulsivas.
      REGRAS:
      - Seja acolhedor mas firme na segurança.
      - Não peça para falar agora se os ânimos estão quentes.
      - Sugira pausa, respiração ou distanciamento temporário.
      
      RETORNO: Envie EXATAMENTE 3 frases curtas, separadas por quebra de linha.
    `;

    const aiResponse = await deepseekService.chat([
      { role: 'system', content: 'Você é o mediador de emergência da UNIA. Foco em desescalar conflitos.' },
      { role: 'user', content: prompt }
    ]);

    const advice = aiResponse.content.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 3);

    // 3. Save session
    const result = await query(
      'INSERT INTO sos_sessions (user_id, relationship_id, advice_received) VALUES ($1, $2, $3) RETURNING *',
      [userId, relationshipId || null, JSON.stringify(advice)]
    );

    res.status(201).json({
      session: result.rows[0],
      advice
    });

  } catch (err) {
    console.error('Error triggering SOS:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
