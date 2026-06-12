import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';
import { aiService } from '../services/aiService.js';

/**
 * Controller to fetch active relationships for a user.
 * Returns relationships with calculated progress data.
 */
export const getActiveRelationships = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Buscar relacionamentos do usuário através de nodes e relationship_members
    const result = await query(
      `SELECT DISTINCT 
        r.id, 
        r.title, 
        r.type, 
        r.status, 
        r.level, 
        r.xp,
        r.updated_at
      FROM relationships r
      INNER JOIN relationship_members rm ON r.id = rm.relationship_id
      INNER JOIN nodes n ON rm.node_id = n.id
      WHERE n.owner_id = $1 AND r.status = 'active'
      ORDER BY r.updated_at DESC`,
      [userId]
    );

    // Calcular percentage e progressValue para cada relacionamento
    const relationships = result.rows.map((rel: any) => {
      const percentage = rel.level * 10; // level * 10%
      const progressValue = Math.min(rel.xp, 100); // xp com máximo de 100%

      return {
        id: rel.id,
        title: rel.title,
        type: rel.type,
        status: rel.status,
        level: rel.level,
        xp: rel.xp,
        percentage,
        progressValue
      };
    });

    res.json(relationships);
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Conexões: todos os relacionamentos do usuário (ativos E arquivados), com
 * dados do parceiro. Diferente de getActiveRelationships, que filtra só ativos.
 */
export const getConnections = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const result = await query(
      `SELECT DISTINCT
         r.id, r.title, r.type, r.status, r.level, r.xp, r.started_at,
         COALESCE(r.is_archived, FALSE) AS is_archived, r.updated_at,
         (SELECT jsonb_build_object('name', pn.name, 'photo_url', pn.photo_url)
            FROM nodes pn
            JOIN relationship_members prm ON pn.id = prm.node_id
            WHERE prm.relationship_id = r.id AND pn.owner_id = $1 AND pn.type <> 'solo'
            LIMIT 1) AS partner_node
       FROM relationships r
       JOIN relationship_members rm ON r.id = rm.relationship_id
       JOIN nodes n ON rm.node_id = n.id
       WHERE n.owner_id = $1
       ORDER BY is_archived ASC, r.updated_at DESC`,
      [userId]
    );

    res.json(result.rows.map((rel: any) => ({
      ...rel,
      percentage: rel.level * 10,
      progressValue: Math.min(rel.xp, 100),
    })));
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Calendário: próximos eventos derivados dos dados existentes — aniversários
 * de relacionamento (started_at) e memórias datadas. Sem integração externa.
 */
export const getCalendar = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const relsRes = await query(
      `SELECT DISTINCT r.id, r.title, r.type, r.started_at
       FROM relationships r
       JOIN relationship_members rm ON r.id = rm.relationship_id
       JOIN nodes n ON rm.node_id = n.id
       WHERE n.owner_id = $1 AND COALESCE(r.is_archived, FALSE) = FALSE AND r.started_at IS NOT NULL`,
      [userId]
    );

    const memRes = await query(
      `SELECT m.id, m.title, m.occurrence_date, r.title AS relationship_title
       FROM memories m
       JOIN relationships r ON m.relationship_id = r.id
       JOIN relationship_members rm ON r.id = rm.relationship_id
       JOIN nodes n ON rm.node_id = n.id
       WHERE n.owner_id = $1
       ORDER BY m.occurrence_date DESC LIMIT 50`,
      [userId]
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Próxima ocorrência anual (mês/dia) de uma data passada.
    const nextAnniversary = (date: Date): Date => {
      const next = new Date(today.getFullYear(), date.getMonth(), date.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return next;
    };

    const events: any[] = [];

    for (const r of relsRes.rows) {
      const started = new Date(r.started_at);
      const next = nextAnniversary(started);
      const years = next.getFullYear() - started.getFullYear();
      events.push({
        type: 'anniversary',
        date: next.toISOString().split('T')[0],
        title: `Aniversário: ${r.title}`,
        subtitle: years > 0 ? `${years} ano${years > 1 ? 's' : ''} juntos` : 'Começo da relação',
        relationshipId: r.id,
      });
    }

    for (const m of memRes.rows) {
      events.push({
        type: 'memory',
        date: new Date(m.occurrence_date).toISOString().split('T')[0],
        title: m.title,
        subtitle: m.relationship_title ? `Memória · ${m.relationship_title}` : 'Memória',
      });
    }

    events.sort((a, b) => a.date.localeCompare(b.date));

    const todayStr = today.toISOString().split('T')[0];
    res.json({
      upcoming: events.filter((e) => e.date >= todayStr).slice(0, 20),
      past: events.filter((e) => e.date < todayStr).reverse().slice(0, 20),
    });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Deep Insight: análise por IA do estado relacional do usuário, baseada nas
 * pílulas de humor e memórias recentes. Alimenta o AlertWidget do dashboard.
 */
export const getInsight = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const pillsRes = await query(
      'SELECT mood, note, created_at FROM daily_pills WHERE user_id = $1 ORDER BY created_at DESC LIMIT 7',
      [userId]
    );

    const memoriesRes = await query(
      `SELECT m.title, m.content, m.occurrence_date
       FROM memories m
       JOIN relationships r ON m.relationship_id = r.id
       JOIN relationship_members rm ON r.id = rm.relationship_id
       JOIN nodes n ON rm.node_id = n.id
       WHERE n.owner_id = $1
       ORDER BY m.occurrence_date DESC LIMIT 5`,
      [userId]
    );

    // Sem dados suficientes: devolve mensagem amigável sem gastar chamada de IA.
    if (pillsRes.rowCount === 0 && memoriesRes.rowCount === 0) {
      return res.json({
        insight: 'Registre seu humor na Pílula do Dia e crie memórias com seus relacionamentos para receber insights personalizados da IA. 💜',
        hasData: false,
      });
    }

    const insight = await aiService.analyzeRelationship(pillsRes.rows, memoriesRes.rows);
    res.json({ insight, hasData: true });
  } catch (error: any) {
    console.error('Error generating insight:', error.response?.data?.error?.message || error.message);
    res.status(200).json({
      insight: 'Não consegui gerar seu insight agora. Continue cultivando suas conexões — tente novamente em instantes.',
      hasData: false,
      error: true,
    });
  }
};
