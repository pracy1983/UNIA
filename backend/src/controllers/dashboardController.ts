import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';

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
