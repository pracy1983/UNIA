import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';

export const createRelationship = async (req: AuthRequest, res: Response) => {
    const { title, type, status, level, xp, settings } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!type) {
        return res.status(400).json({ message: 'Type is required' });
    }

    try {
        const result = await query(
            `INSERT INTO relationships (title, type, status, level, xp, settings) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
            [
                title || null,
                type,
                status || 'active',
                level || 1,
                xp || 0,
                settings ? JSON.stringify(settings) : '{}'
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getRelationships = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await query(
            'SELECT * FROM relationships ORDER BY created_at DESC'
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getRelationshipById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await query(
            'SELECT * FROM relationships WHERE id = $1',
            [id]
        );

        if (!result.rowCount || result.rowCount === 0) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateRelationship = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, type, status, level, xp, settings } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const checkResult = await query(
            'SELECT id FROM relationships WHERE id = $1',
            [id]
        );

        if (!checkResult.rowCount || checkResult.rowCount === 0) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        const result = await query(
            `UPDATE relationships 
       SET title = COALESCE($1, title),
           type = COALESCE($2, type),
           status = COALESCE($3, status),
           level = COALESCE($4, level),
           xp = COALESCE($5, xp),
           settings = COALESCE($6, settings),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
            [
                title,
                type,
                status,
                level,
                xp,
                settings ? JSON.stringify(settings) : null,
                id
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteRelationship = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await query(
            'DELETE FROM relationships WHERE id = $1 RETURNING id',
            [id]
        );

        if (!result.rowCount || result.rowCount === 0) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        res.json({ message: 'Relationship deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
