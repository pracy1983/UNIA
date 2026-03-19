import { Request, Response } from 'express';
import { query } from '../config/database.js';

/**
 * Controller to fetch active relationships for a user.
 * Prepared for future integration with real database tables.
 */
export const getActiveRelationships = async (req: Request, res: Response) => {
  try {
    // In the future, we will fetch real data from a 'relationships' table.
    // const userId = (req as any).user.id;
    // const result = await query('SELECT * FROM relationships WHERE user_id = $1', [userId]);
    
    // For now, per user request: "If there are no entries, don't put anything".
    // We return an empty list until real data is registered.
    res.json([]);
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
