import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { query } from '../config/database.js';
import { validateCPF } from '../utils/validation.js';

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
        // Fetch current profile to check CPF status
        const userRes = await query('SELECT cpf FROM users WHERE id = $1', [userId]);
        const existingCpf = userRes.rows[0]?.cpf;

        // Validation for new CPF if provided
        if (cpf) {
            const cleanNewCpf = cpf.replace(/[^\d]/g, '');
            const cleanExistingCpf = existingCpf ? existingCpf.replace(/[^\d]/g, '') : '';

            // If CPF is already set (non-empty), block changes if different
            if (cleanExistingCpf && cleanExistingCpf !== '' && cleanNewCpf !== cleanExistingCpf) {
                return res.status(400).json({ message: 'O CPF não pode ser alterado após definido.' });
            }

            // Validate CPF format/digits
            if (!validateCPF(cpf)) {
                return res.status(400).json({ message: 'CPF inválido. Verifique os dígitos.' });
            }
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
        if (display_name || photo_url) {
            await query(
                `UPDATE nodes SET name = COALESCE($1, name), photo_url = COALESCE($2, photo_url) WHERE owner_id = $3 AND type = 'solo'`,
                [display_name, photo_url, userId]
            );
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating profile:', err);
        // Supabase error codes for duplicate key violation
        if ((err as any).code === '23505') {
             return res.status(400).json({ message: 'CPF ou E-mail já em uso por outro usuário.' });
        }
        res.status(500).json({ message: 'Erro interno ao atualizar perfil.' });
    }
};
