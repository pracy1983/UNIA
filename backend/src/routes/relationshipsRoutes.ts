import { Router } from 'express';
import {
    createRelationship,
    getRelationships,
    getRelationshipById,
    updateRelationship,
    deleteRelationship
} from '../controllers/relationshipsController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas protegidas por autenticação
router.post('/', authMiddleware, createRelationship);
router.get('/', authMiddleware, getRelationships);
router.get('/:id', authMiddleware, getRelationshipById);
router.put('/:id', authMiddleware, updateRelationship);
router.delete('/:id', authMiddleware, deleteRelationship);

export default router;
