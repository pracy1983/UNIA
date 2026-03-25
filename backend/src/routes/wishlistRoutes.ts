import { Router } from 'express';
import {
    createWishlistItem,
    getWishlistItems,
    getPersonalWishlist,
    deleteWishlistItem
} from '../controllers/wishlistController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/', authMiddleware, createWishlistItem);
router.get('/personal', authMiddleware, getPersonalWishlist);
router.get('/:relationshipId', authMiddleware, getWishlistItems);
router.delete('/:id', authMiddleware, deleteWishlistItem);

export default router;
