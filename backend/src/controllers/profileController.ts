import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { query } from '../config/database.js';

export const getProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await query(
            'SELECT id, email, display_name, cpf, birth_date, photo_url FROM users WHERE id = $1',
            [userId]
        );

        if (!result.rowCount || result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { display_name, email, cpf, birth_date, photo_url } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!cpf) {
        return res.status(400).json({ message: 'CPF is required' });
    }

    try {
        const result = await query(
            `UPDATE users 
             SET display_name = COALESCE($1, display_name),
                 email = COALESCE($2, email),
                 cpf = COALESCE($3, cpf),
                 birth_date = COALESCE($4, birth_date),
                 photo_url = COALESCE($5, photo_url)
             WHERE id = $6
             RETURNING id, email, display_name, cpf, birth_date, photo_url`,
            [display_name, email, cpf, birth_date, photo_url, userId]
        );

        // Update the owner's node name and photo_url if setting from Profile
        await query(
            `UPDATE nodes SET name = $1, photo_url = $2 WHERE owner_id = $3 AND type = 'solo'`,
            [display_name, photo_url, userId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating profile:', err);
        // Supabase error codes for duplicate key violation
        if ((err as any).code === '23505') {
             return res.status(400).json({ message: 'CPF or Email already in use' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};
