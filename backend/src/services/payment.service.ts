/**
 * Payment service: MVP supports cash on delivery (pending until delivery).
 * Card payments are a placeholder for future HyperPay integration.
 */
import { Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';
import { prisma } from '../config';

export interface ProcessPaymentInput {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  /** For card payments: HyperPay checkout ID (placeholder) */
  checkoutId?: string;
}

export interface PaymentResult {
  payment: {
    id: string;
    orderId: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    transactionId: string | null;
    amount: number;
  };
  /** For card: HyperPay redirect URL (placeholder) */
  redirectUrl?: string;
}

/**
 * Process payment based on method.
 * Cash: Creates payment record with pending status (paid on delivery).
 * Card: Placeholder for HyperPay integration.
 */
export async function processPayment(input: ProcessPaymentInput): Promise<PaymentResult> {
  const { paymentMethod } = input;

  if (paymentMethod === 'cash') {
    return processCashPayment(input);
  }

  if (paymentMethod === 'card') {
    return processCardPayment(input);
  }

  throw new Error(`Unsupported payment method: ${paymentMethod}`);
}

async function processCashPayment(input: ProcessPaymentInput): Promise<PaymentResult> {
  const { orderId, amount } = input;

  const payment = await prisma.payment.create({
    data: {
      orderId,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      amount: new Prisma.Decimal(amount),
    },
  });

  return {
    payment: {
      id: payment.id,
      orderId: payment.orderId,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      transactionId: payment.transactionId,
      amount: Number(payment.amount),
    },
  };
}

/**
 * Placeholder for HyperPay card payment integration.
 * TODO: Implement full HyperPay flow:
 * - Create checkout session via HyperPay API
 * - Return redirect URL for payment page
 * - Handle webhook/callback to update payment status
 */
async function processCardPayment(input: ProcessPaymentInput): Promise<PaymentResult> {
  const { orderId, amount, checkoutId } = input;

  const payment = await prisma.payment.create({
    data: {
      orderId,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      transactionId: checkoutId ?? null,
      amount: new Prisma.Decimal(amount),
    },
  });

  // Placeholder: HyperPay integration would return actual redirect URL
  const redirectUrl = process.env.HYPERPAY_CHECKOUT_URL
    ? `${process.env.HYPERPAY_CHECKOUT_URL}?checkoutId=${checkoutId ?? 'placeholder'}`
    : undefined;

  return {
    payment: {
      id: payment.id,
      orderId: payment.orderId,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      transactionId: payment.transactionId,
      amount: Number(payment.amount),
    },
    redirectUrl,
  };
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  transactionId?: string
): Promise<void> {
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      paymentStatus: status,
      ...(transactionId && { transactionId }),
    },
  });
}

export async function getPaymentByOrder(orderId: string) {
  return prisma.payment.findMany({
    where: { orderId },
    orderBy: { id: 'desc' },
  });
}
