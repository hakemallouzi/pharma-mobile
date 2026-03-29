import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { prisma } from './config';
import { setSocket, registerOrderHandlers } from './sockets';

const PORT = process.env.PORT || 3000;

// Initialize Prisma client
prisma.$connect().catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
});

setSocket(io);
registerOrderHandlers(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export socket instance for use in other parts of the app
export { server, io };
