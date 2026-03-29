import 'dotenv/config';
import path from 'path';
import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import addressRoutes from './routes/address.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';

const app: Application = express();

// Static files (prescription images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));

// JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (_req, res) => {
  res.send('Pharmacy API running 🚀');
});

// Routes
app.use('/auth', authRoutes);
app.use('/addresses', addressRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

export default app;
