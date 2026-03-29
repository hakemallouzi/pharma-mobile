import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'prescriptions');

export async function uploadPrescription(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id: orderId } = req.params;

    if (!req.file) {
      res.status(400).json({ error: 'Image file is required. Use field name "image"' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { prescription: true },
    });

    if (!order) {
      fs.unlink(req.file.path, () => {});
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== userId) {
      fs.unlink(req.file.path, () => {});
      res.status(403).json({ error: 'Not authorized to add prescription to this order' });
      return;
    }

    const imagePath = `/uploads/prescriptions/${req.file.filename}`;

    const prescription = await prisma.prescription.upsert({
      where: { orderId },
      create: {
        orderId,
        imageUrl: imagePath,
        verified: false,
      },
      update: {
        imageUrl: imagePath,
        verified: false,
      },
    });

    res.status(201).json(prescription);
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path as string)) {
      fs.unlink(req.file.path, () => {});
    }
    console.error('Upload prescription error:', error);
    res.status(500).json({ error: 'Failed to upload prescription' });
  }
}
