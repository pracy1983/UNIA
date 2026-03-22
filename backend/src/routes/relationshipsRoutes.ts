import { Router } from 'express';
import {
    createRelationship,
    getRelationships,
    getRelationshipById,
    updateRelationship,
    deleteRelationship,
    archiveRelationship,
    getRelationshipByInvite,
    acceptRelationshipInvite
} from '../controllers/relationshipsController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas protegidas por autenticação
router.post('/', authMiddleware, createRelationship);
router.get('/', authMiddleware, getRelationships);
router.get('/:id', authMiddleware, getRelationshipById);
router.put('/:id', authMiddleware, updateRelationship);
router.put('/:id/archive', authMiddleware, archiveRelationship);
router.delete('/:id', authMiddleware, deleteRelationship);

// Rotas de Convite
router.get('/invite/:token', authMiddleware, getRelationshipByInvite);
router.post('/invite/accept', authMiddleware, acceptRelationshipInvite);

export default router;
