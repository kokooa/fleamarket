import { Router } from 'express';
import {
    getPendingProducts,
    approveProduct,
    rejectProduct,
    getAllUsers,
    getAllOrders,
    getStatistics,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/statistics', getStatistics);

export default router;
