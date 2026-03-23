import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';

export const createWishlistItem = async (req: AuthRequest, res: Response) => {
    const { relationshipId, title, linkUrl, imageUrl, description, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const relId = relationshipId || null;
        const result = await query(
            `INSERT INTO wishlist_items (relationship_id, user_id, title, link_url, image_url, description, category)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [relId, userId, title, linkUrl, imageUrl, description, category]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getWishlistItems = async (req: AuthRequest, res: Response) => {
    const { relationshipId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await query(
            'SELECT * FROM wishlist_items WHERE relationship_id = $1 ORDER BY created_at DESC',
            [relationshipId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPersonalWishlist = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await query(
            'SELECT * FROM wishlist_items WHERE user_id = $1 AND relationship_id IS NULL ORDER BY created_at DESC',
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteWishlistItem = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await query(
            'DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        if (!result.rowCount || result.rowCount === 0) {
            return res.status(404).json({ message: 'Item not found or unauthorized' });
        }

        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
