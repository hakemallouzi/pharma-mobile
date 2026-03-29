/**
 * Creates an admin user and outputs a JWT token for testing.
 * Run: npx ts-node scripts/create-test-admin.ts
 */
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = (process.env.JWT_EXPIRY || '7d') as jwt.SignOptions['expiresIn'];

const ADMIN_PHONE = '0790000000';

async function main() {
  // Ensure pharmacy exists (required for orders)
  let pharmacy = await prisma.pharmacy.findFirst();
  if (!pharmacy) {
    pharmacy = await prisma.pharmacy.create({
      data: {
        name: 'Test Pharmacy',
        phone: '0792222222',
        address: 'Amman, Shafa Badran',
        latitude: 31.963158,
        longitude: 35.930359,
      },
    });
    console.log('Pharmacy created');
  }

  let user = await prisma.user.findUnique({
    where: { phone: ADMIN_PHONE },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: ADMIN_PHONE,
        name: 'Test Admin',
        role: 'admin',
      },
    });
    console.log('Admin user created');
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
    });
    console.log('Existing user updated to admin');
  }

  const token = jwt.sign(
    { userId: user.id, phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  console.log('\nAdmin JWT token (copy for test script):');
  console.log(token);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
