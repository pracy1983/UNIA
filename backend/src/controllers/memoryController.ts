import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';

export const createMemory = async (req: AuthRequest, res: Response) => {
  const { relationship_id, title, content, occurrence_date, media_urls, tags } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!relationship_id || !title || !occurrence_date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Verify membership
    const membership = await query(
      'SELECT id FROM relationship_members WHERE relationship_id = $1 AND node_id IN (SELECT id FROM nodes WHERE owner_id = $2)',
      [relationship_id, userId]
    );

    if (!membership.rowCount || membership.rowCount === 0) {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this relationship' });
    }

    const result = await query(
      `INSERT INTO memories (relationship_id, title, content, occurrence_date, media_urls, tags, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [relationship_id, title, content, occurrence_date, JSON.stringify(media_urls || []), JSON.stringify(tags || [])]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating memory:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMemoriesByRelationship = async (req: AuthRequest, res: Response) => {
  const { relId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const result = await query(
      `SELECT * FROM memories 
       WHERE relationship_id = $1 
       ORDER BY occurrence_date DESC`,
      [relId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
