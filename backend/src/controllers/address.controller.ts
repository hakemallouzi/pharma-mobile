import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config';

export async function listAddresses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
    });

    res.status(200).json(addresses);
  } catch (error) {
    console.error('List addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
}

export async function createAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { city, area, street, latitude, longitude, notes } = req.body;
    // area optional: default to empty string for backward compat

    if (!city || !street) {
      res.status(400).json({ error: 'city and street are required' });
      return;
    }

    const address = await prisma.address.create({
      data: {
        userId,
        city,
        area: area ?? '',
        street,
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        notes: notes ?? null,
      },
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
}
