import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

export function registerOrderHandlers(server: Server): void {
  server.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        phone: string;
        role: string;
      };

      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  server.on('connection', (socket: AuthenticatedSocket) => {
    if (socket.role === 'admin') {
      socket.join('admin');
    }

    socket.on('subscribe_order', async (orderId: string) => {
      if (!orderId || typeof orderId !== 'string') {
        socket.emit('error', { message: 'Invalid orderId' });
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        socket.emit('error', { message: 'Order not found' });
        return;
      }

      if (order.userId !== socket.userId && socket.role !== 'admin') {
        socket.emit('error', { message: 'Unauthorized to subscribe to this order' });
        return;
      }

      socket.join(`order:${orderId}`);
      socket.emit('subscribed', { orderId });
    });

    socket.on('unsubscribe_order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });
  });
}
