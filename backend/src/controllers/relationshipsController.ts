import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middlewares/auth.js';

export const createRelationship = async (req: AuthRequest, res: Response) => {
    const { type, partnerName, startedAt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!type) {
        return res.status(400).json({ message: 'Type is required' });
    }

    try {
        // 1. Criar o relacionamento
        const relResult = await query(
            `INSERT INTO relationships (type, status, level, xp, settings, title, started_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [type, 'active', 1, 0, '{}', partnerName || 'Novo Relacionamento', startedAt || new Date()]
        );

        const relationship = relResult.rows[0];

        // 2. Buscar ou criar node do usuário (Dono)
        let nodeResult = await query(
            'SELECT id FROM nodes WHERE owner_id = $1 AND type = $2 LIMIT 1',
            [userId, 'solo']
        );

        let userNodeId;
        if (nodeResult.rows.length === 0) {
            const newNode = await query(
                'INSERT INTO nodes (owner_id, name, type, metadata) VALUES ($1, $2, $3, $4) RETURNING id',
                [userId, 'Meu Node', 'solo', '{}']
            );
            userNodeId = newNode.rows[0].id;
        } else {
            userNodeId = nodeResult.rows[0].id;
        }

        // 3. Vincular usuário proprietário como admin
        await query(
            'INSERT INTO relationship_members (relationship_id, node_id, role, permissions) VALUES ($1, $2, $3, $4)',
            [relationship.id, userNodeId, 'admin', '{}']
        );

        // 4. Se houver nome do parceiro, criar node para o parceiro
        if (partnerName) {
            const partnerNode = await query(
                'INSERT INTO nodes (owner_id, name, type, metadata) VALUES ($1, $2, $3, $4) RETURNING id',
                [userId, partnerName, 'individual', '{}']
            );
            const partnerNodeId = partnerNode.rows[0].id;

            // Vincular parceiro como member
            await query(
                'INSERT INTO relationship_members (relationship_id, node_id, role, permissions) VALUES ($1, $2, $3, $4)',
                [relationship.id, partnerNodeId, 'member', '{}']
            );
        }

        res.status(201).json(relationship);
    } catch (err) {
        console.error('Erro ao criar relacionamento:', err);
        res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
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
            'SELECT type, status, started_at FROM relationships WHERE id = $1',
            [id]
        );

        if (!checkResult.rowCount || checkResult.rowCount === 0) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        const oldRel = checkResult.rows[0];
        const { changeDate } = req.body; // Opcional: data da mudança fornecida pelo frontend

        const result = await query(
            `UPDATE relationships 
       SET title = COALESCE($1, title),
           type = COALESCE($2, type),
           status = COALESCE($3, status),
           level = COALESCE($4, level),
           xp = COALESCE($5, xp),
           settings = COALESCE($6, settings),
           started_at = COALESCE($7, started_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
            [
                title,
                type,
                status,
                level,
                xp,
                settings ? JSON.stringify(settings) : null,
                req.body.startedAt,
                id
            ]
        );

        const newRel = result.rows[0];

        // Se o TIPO ou STATUS mudou, registrar no histórico
        if (type && type !== oldRel.type) {
            await query(
                'INSERT INTO relationship_history (relationship_id, old_type, new_type, change_date) VALUES ($1, $2, $3, $4)',
                [id, oldRel.type, type, changeDate || new Date()]
            );
        }

        res.json(newRel);
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
export const archiveRelationship = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await query(
            'UPDATE relationships SET is_archived = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
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

export const getRelationshipByInvite = async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    try {
        const result = await query(
            'SELECT * FROM relationships WHERE invite_token = $1',
            [token]
        );

        if (!result.rowCount || result.rowCount === 0) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const acceptRelationshipInvite = async (req: AuthRequest, res: Response) => {
    const { token } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const relResult = await query(
            'SELECT id FROM relationships WHERE invite_token = $1',
            [token]
        );

        if (!relResult.rowCount || relResult.rowCount === 0) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        const relationshipId = relResult.rows[0].id;

        // Buscar node do usuário
        let nodeResult = await query(
            'SELECT id FROM nodes WHERE owner_id = $1 AND type = $2 LIMIT 1',
            [userId, 'solo']
        );

        if (nodeResult.rows.length === 0) {
            return res.status(400).json({ message: 'User node not found. Complete onboarding first.' });
        }

        const userNodeId = nodeResult.rows[0].id;

        // Vincular usuário como member
        await query(
            'INSERT INTO relationship_members (relationship_id, node_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [relationshipId, userNodeId, 'member']
        );

        res.json({ message: 'Invite accepted successfully', relationshipId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
