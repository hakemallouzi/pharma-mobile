import { Prisma, PaymentMethod } from '@prisma/client';
import { prisma } from '../config';

export interface CreateOrderItemInput {
  medicineName: string;
  quantity: number;
  price?: number;
}

export interface CreateOrderInput {
  userId: string;
  addressId: string;
  pharmacyId: string;
  paymentMethod: PaymentMethod;
  items: CreateOrderItemInput[];
}

export async function getFirstPharmacy() {
  return prisma.pharmacy.findFirst();
}

export async function validateUserAddress(userId: string, addressId: string): Promise<boolean> {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  return !!address;
}

export async function createOrder(input: CreateOrderInput) {
  const { userId, addressId, pharmacyId, paymentMethod, items } = input;

  const totalPrice = items.reduce((sum, item) => {
    const price = item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      userId,
      addressId,
      pharmacyId,
      paymentMethod,
      status: 'pending',
      totalPrice: new Prisma.Decimal(totalPrice),
      items: {
        create: items.map((item) => ({
          medicineName: item.medicineName,
          quantity: item.quantity,
          price: new Prisma.Decimal(item.price ?? 0),
        })),
      },
    },
    include: {
      items: true,
      address: true,
      pharmacy: true,
    },
  });

  return order;
}
