import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config';
import { emitOrderStatusUpdated } from '../sockets';
import { OrderStatus } from '@prisma/client';

const ALLOWED_STATUSES: OrderStatus[] = [
  'pending',
  'searching_pharmacy',
  'confirmed',
  'driver_assigned',
  'on_the_way',
  'delivered',
  'cancelled',
];

export async function getAllOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: true,
        address: true,
        pharmacy: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      res.status(400).json({
        error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
      });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        items: true,
        address: true,
        pharmacy: true,
        driver: true,
      },
    });

    emitOrderStatusUpdated(id, status);

    res.status(200).json(order);
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

export async function assignDriver(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      res.status(400).json({ error: 'driverId is required' });
      return;
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        driverId,
        status: 'driver_assigned',
      },
      include: {
        user: true,
        items: true,
        address: true,
        pharmacy: true,
        driver: true,
      },
    });

    emitOrderStatusUpdated(id, 'driver_assigned');

    res.status(200).json(order);
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    console.error('Assign driver error:', error);
    res.status(500).json({ error: 'Failed to assign driver' });
  }
}

export async function listDrivers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(drivers);
  } catch (error) {
    console.error('List drivers error:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
}

export async function createDriver(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, phone, vehicleType } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: 'name and phone are required' });
      return;
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        phone,
        vehicleType: vehicleType ?? 'car',
      },
    });

    res.status(201).json(driver);
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ error: 'Failed to create driver' });
  }
}
