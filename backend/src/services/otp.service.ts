import { prisma } from '../config';

const OTP_EXPIRY_MINUTES = 5;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      phone,
      code,
      expiresAt,
    },
  });

  // Simulate sending SMS
  console.log(`[SMS] OTP for ${phone}: ${code} (expires in ${OTP_EXPIRY_MINUTES} minutes)`);

  return {
    success: true,
    message: 'OTP sent successfully',
  };
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ valid: boolean; message: string }> {
  const otpRecord = await prisma.otpCode.findFirst({
    where: { phone, code },
    orderBy: { expiresAt: 'desc' },
  });

  if (!otpRecord) {
    return { valid: false, message: 'Invalid OTP' };
  }

  if (new Date() > otpRecord.expiresAt) {
    return { valid: false, message: 'OTP has expired' };
  }

  return { valid: true, message: 'OTP verified' };
}
