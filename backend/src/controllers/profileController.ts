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
            'SELECT id, email, display_name, full_name, cpf, birth_date, photo_url FROM users WHERE id = $1',
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
    const { display_name, email, full_name, cpf, birth_date, photo_url } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Check if CPF is already set
        const userRes = await query('SELECT cpf FROM users WHERE id = $1', [userId]);
        const existingCpf = userRes.rows[0]?.cpf;

        // If CPF is being updated but already exists, block it
        if (existingCpf && cpf && existingCpf !== cpf) {
            return res.status(400).json({ message: 'CPF cannot be changed once set' });
        }

        const result = await query(
            `UPDATE users 
             SET display_name = COALESCE($1, display_name),
                 email = COALESCE($2, email),
                 full_name = COALESCE($3, full_name),
                 cpf = COALESCE($4, cpf),
                 birth_date = COALESCE($5, birth_date),
                 photo_url = COALESCE($6, photo_url)
             WHERE id = $7
             RETURNING id, email, display_name, full_name, cpf, birth_date, photo_url`,
            [display_name, email, full_name, cpf, birth_date, photo_url, userId]
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
