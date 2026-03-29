import { Server } from 'socket.io';

let io: Server | null = null;

export function setSocket(server: Server): void {
  io = server;
}

export function getSocket(): Server | null {
  return io;
}

export function emitNewOrder(order: object): void {
  if (io) {
    io.to('admin').emit('new_order', order);
  }
}

export function emitOrderStatusUpdated(orderId: string, status: string): void {
  if (io) {
    const payload = { orderId, status };
    io.to('admin').emit('order_status_updated', payload);
    io.to(`order:${orderId}`).emit('order_status_updated', payload);
  }
}
