import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/orders', adminController.getAllOrders);
router.get('/drivers', adminController.listDrivers);
router.patch('/orders/:id/status', adminController.updateOrderStatus);
router.patch('/orders/:id/assign-driver', adminController.assignDriver);
router.post('/drivers', adminController.createDriver);

export default router;
