import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config';
import * as orderService from '../services/order.service';
import * as paymentService from '../services/payment.service';
import { emitNewOrder } from '../sockets';
import { PaymentMethod } from '@prisma/client';

export async function listMyOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        address: true,
        pharmacy: true,
        driver: true,
        prescription: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('List my orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { items, addressId, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items array is required and must not be empty' });
      return;
    }

    if (!addressId) {
      res.status(400).json({ error: 'addressId is required' });
      return;
    }

    const addressValid = await orderService.validateUserAddress(userId, String(addressId));
    if (!addressValid) {
      res.status(400).json({ error: 'Invalid address or address does not belong to user' });
      return;
    }

    const validPaymentMethods: PaymentMethod[] = ['cash', 'card'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      res.status(400).json({ error: 'paymentMethod must be "cash" or "card"' });
      return;
    }

    const validItems = items.every(
      (item: unknown) =>
        item &&
        typeof item === 'object' &&
        'medicineName' in item &&
        typeof (item as { medicineName: unknown }).medicineName === 'string' &&
        'quantity' in item &&
        typeof (item as { quantity: unknown }).quantity === 'number'
    );

    if (!validItems) {
      res.status(400).json({
        error: 'Each item must have medicineName (string) and quantity (number)',
      });
      return;
    }

    let pharmacyId = req.body.pharmacyId;
    if (!pharmacyId) {
      const firstPharmacy = await orderService.getFirstPharmacy();
      if (!firstPharmacy) {
        res.status(400).json({ error: 'No pharmacy available. Please add a pharmacy first.' });
        return;
      }
      pharmacyId = firstPharmacy.id;
    }

    const order = await orderService.createOrder({
      userId,
      addressId: String(addressId),
      pharmacyId: String(pharmacyId),
      paymentMethod,
      items: items.map((item: { medicineName: string; quantity: number; price?: number }) => ({
        medicineName: item.medicineName,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    const totalAmount = Number(order.totalPrice);
    await paymentService.processPayment({
      orderId: order.id,
      paymentMethod,
      amount: totalAmount,
    });

    emitNewOrder(order);

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}
