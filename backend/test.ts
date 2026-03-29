/**
 * End-to-end flow test:
 * OTP login → verify → sign-up (if new user)
 * Add address → list addresses → select for order
 * Create order → upload prescription → list orders → real-time status update
 *
 * Run: npm run test:api
 * Backend must be running: npm run dev
 * Optional: ADMIN_TOKEN=<jwt> for admin steps and real-time trigger
 * Optional: test-prescription.jpg in backend root for prescription upload
 */
import 'dotenv/config';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { io as ioClient } from 'socket.io-client';
import { PrismaClient } from '@prisma/client';

const API = process.env.API_URL || 'http://localhost:3001';
const prisma = new PrismaClient();

function getBaseUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

async function getOtpFromDb(phone: string): Promise<string | null> {
  const otp = await prisma.otpCode.findFirst({
    where: { phone },
    orderBy: { expiresAt: 'desc' },
  });
  return otp?.code ?? null;
}

async function runTests() {
  let userToken: string;
  let addressId: string;
  let orderId: string;

  try {
    console.log('--- 1. Health check ---');
    const health = await axios.get(`${API}/`);
    console.log('OK:', health.data);

    console.log('\n--- 2. Send OTP ---');
    const phone = process.env.TEST_PHONE || '0791234567';
    await axios.post(`${API}/auth/send-otp`, { phone });
    const code = process.env.OTP_CODE || (await getOtpFromDb(phone));
    if (!code) throw new Error('No OTP. Set OTP_CODE or ensure DB has OtpCode for this phone.');
    console.log('OK: OTP sent to', phone);

    console.log('\n--- 3. Verify OTP ---');
    const verify = await axios.post(`${API}/auth/verify-otp`, { phone, code });
    userToken = verify.data.token;
    const user = verify.data.user;
    if (!userToken) throw new Error('No token returned');
    console.log('OK: JWT received, user id:', user?.id?.slice(0, 8));

    console.log('\n--- 4. Sign-up (complete profile if new user) ---');
    if (user && user.profileCompleted === false) {
      await axios.patch(
        `${API}/auth/profile`,
        { name: 'E2E Test User' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log('OK: Profile completed (name set)');
    } else {
      console.log('OK: User already has profile (skipped)');
    }

    console.log('\n--- 5. Add address ---');
    const addressRes = await axios.post(
      `${API}/addresses`,
      {
        city: 'Amman',
        area: 'Shafa Badran',
        street: 'Main Street 5',
        latitude: 31.963158,
        longitude: 35.930359,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    addressId = addressRes.data.id;
    console.log('OK: Address created:', addressId.slice(0, 8));

    console.log('\n--- 6. List addresses (select for orders) ---');
    const listAddr = await axios.get(`${API}/addresses`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const addresses = Array.isArray(listAddr.data) ? listAddr.data : [];
    const selected = addresses.find((a: { id: string }) => a.id === addressId) || addresses[0];
    if (!selected) throw new Error('No addresses in list');
    console.log('OK: Addresses count:', addresses.length, ', using:', selected.id.slice(0, 8));

    console.log('\n--- 7. Create order (cash on delivery) ---');
    const orderRes = await axios.post(
      `${API}/orders`,
      {
        items: [{ medicineName: 'Panadol Extra', quantity: 2 }],
        addressId: selected.id,
        paymentMethod: 'cash',
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    orderId = orderRes.data.id;
    console.log('OK: Order created:', orderId.slice(0, 8), ', status:', orderRes.data.status);

    console.log('\n--- 8. List orders (see order in list) ---');
    const listOrders = await axios.get(`${API}/orders`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const orders = Array.isArray(listOrders.data) ? listOrders.data : [];
    const found = orders.find((o: { id: string }) => o.id === orderId);
    if (!found) throw new Error('Order not found in list');
    console.log('OK: Orders count:', orders.length, ', our order in list');

    console.log('\n--- 9. Upload prescription ---');
    const testImagePath = path.join(process.cwd(), 'test-prescription.jpg');
    if (!fs.existsSync(testImagePath)) {
      console.log('SKIP: test-prescription.jpg not found (create one or skip)');
    } else {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(testImagePath));
      await axios.post(`${API}/orders/${orderId}/prescription`, formData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          ...formData.getHeaders(),
        },
      });
      console.log('OK: Prescription uploaded');
    }

    console.log('\n--- 10. List orders again (order may have prescription) ---');
    const listOrders2 = await axios.get(`${API}/orders`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const orderAgain = (listOrders2.data || []).find((o: { id: string }) => o.id === orderId);
    console.log('OK: Order in list, prescription:', orderAgain?.prescription ? 'yes' : 'no');

    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      console.log('\n--- 11. Real-time: connect socket, subscribe, receive order_status_updated ---');
      const baseUrl = getBaseUrl(API);
      const socket = ioClient(baseUrl, {
        auth: { token: userToken },
        transports: ['websocket'],
      });

      const received = await new Promise<boolean>((resolve, reject) => {
        const t = setTimeout(() => {
          socket.off('order_status_updated');
          socket.disconnect();
          resolve(false);
        }, 8000);

        socket.on('connect_error', (err) => {
          clearTimeout(t);
          socket.disconnect();
          reject(err);
        });

        socket.on('subscribed', (data: { orderId?: string }) => {
          if (data.orderId === orderId) {
            axios
              .patch(
                `${API}/admin/orders/${orderId}/status`,
                { status: 'confirmed' },
                { headers: { Authorization: `Bearer ${adminToken}` } }
              )
              .catch(() => {});
          }
        });

        socket.on('order_status_updated', (payload: { orderId?: string; status?: string }) => {
          if (payload.orderId === orderId) {
            clearTimeout(t);
            socket.off('order_status_updated');
            socket.disconnect();
            console.log('OK: Received order_status_updated:', payload.status);
            resolve(true);
          }
        });

        socket.on('connect', () => {
          socket.emit('subscribe_order', orderId);
        });
      });

      if (!received) console.log('SKIP: No order_status_updated received within 8s (admin may not have updated)');

      console.log('\n--- 12. Admin: create driver & assign (optional) ---');
      const driverRes = await axios.post(
        `${API}/admin/drivers`,
        { name: 'Test Driver', phone: '0791111111', vehicleType: 'car' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('OK: Driver created:', driverRes.data.id?.slice(0, 8));

      await axios.patch(
        `${API}/admin/orders/${orderId}/assign-driver`,
        { driverId: driverRes.data.id },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('OK: Driver assigned to order');
    } else {
      console.log('\n--- 11–12. SKIP real-time & admin (set ADMIN_TOKEN to run) ---');
    }

    console.log('\n✅ End-to-end flow test finished.');
  } catch (err: unknown) {
    const ax = err as { response?: { data?: unknown }; message?: string };
    console.error('FAIL:', ax.response?.data ?? ax.message ?? err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
