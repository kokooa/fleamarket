import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    addProductImages,
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireSeller } from '../middleware/role.middleware';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes (seller/admin only)
router.post('/', authenticate, requireSeller, createProduct);
router.put('/:id', authenticate, requireSeller, updateProduct);
router.delete('/:id', authenticate, requireSeller, deleteProduct);
router.post('/:id/images', authenticate, requireSeller, addProductImages);

export default router;
