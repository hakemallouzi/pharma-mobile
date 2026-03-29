import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadPrescription } from '../middleware/upload.middleware';
import * as orderController from '../controllers/order.controller';
import * as prescriptionController from '../controllers/prescription.controller';

const router = Router();

router.get('/', authMiddleware, orderController.listMyOrders);
router.post('/', authMiddleware, orderController.createOrder);
router.post(
  '/:id/prescription',
  authMiddleware,
  (req, res, next) => {
    uploadPrescription(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message || 'File upload failed' });
        return;
      }
      next();
    });
  },
  prescriptionController.uploadPrescription
);

export default router;
