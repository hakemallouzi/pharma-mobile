import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as addressController from '../controllers/address.controller';

const router = Router();

router.get('/', authMiddleware, addressController.listAddresses);
router.post('/', authMiddleware, addressController.createAddress);

export default router;
