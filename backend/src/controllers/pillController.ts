import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';

/**
 * Controller for Daily Pills (Mood/Profile state).
 * Pills are user-centric and help describe the user's state to partners.
 */
export const createPill = async (req: AuthRequest, res: Response) => {
  const { mood, note } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!mood) {
    return res.status(400).json({ message: 'Mood is required' });
  }

  try {
    // Only one pill per user per day
    const today = new Date().toISOString().split('T')[0];
    
    const result = await query(
      `INSERT INTO daily_pills (user_id, mood, note, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, date_trunc('day', created_at)) 
       DO UPDATE SET mood = $2, note = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, mood, note, new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving pill:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLatestPill = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const result = await query(
      'SELECT * FROM daily_pills WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get the latest pills for all members in a relationship.
 */
export const getRelationshipMemberPills = async (req: AuthRequest, res: Response) => {
  const { relId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 1. Verify user is in the relationship
    const membership = await query(
      'SELECT id FROM relationship_members WHERE relationship_id = $1 AND node_id IN (SELECT id FROM nodes WHERE owner_id = $2)',
      [relId, userId]
    );

    if (!membership.rowCount || membership.rowCount === 0) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 2. Fetch latest pills of all members
    const result = await query(
      `SELECT DISTINCT ON (u.id) 
        u.id as user_id, 
        u.display_name, 
        u.profile_image_url,
        dp.mood, 
        dp.note, 
        dp.created_at
       FROM relationship_members rm
       INNER JOIN nodes n ON rm.node_id = n.id
       INNER JOIN users u ON n.owner_id = u.id
       LEFT JOIN daily_pills dp ON dp.user_id = u.id
       WHERE rm.relationship_id = $1
       ORDER BY u.id, dp.created_at DESC`,
      [relId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
