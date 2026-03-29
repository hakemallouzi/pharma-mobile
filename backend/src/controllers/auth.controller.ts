import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../config';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as otpService from '../services/otp.service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = (process.env.JWT_EXPIRY || '7d') as jwt.SignOptions['expiresIn'];

export async function sendOtp(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string') {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    const result = await otpService.sendOtp(phone.trim());
    res.status(200).json(result);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}

export async function verifyOtp(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { phone, code } = req.body;

    if (!phone || typeof phone !== 'string') {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'OTP code is required' });
      return;
    }

    const result = await otpService.verifyOtp(phone.trim(), code.trim());

    if (!result.valid) {
      res.status(401).json({ error: result.message });
      return;
    }

    // Create user if not exists
    let user = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: phone.trim(),
          name: phone.trim(),
          role: UserRole.user,
          profileCompleted: false,
        },
      });
    }

    const signOptions: jwt.SignOptions = { expiresIn: JWT_EXPIRY };
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      signOptions
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
}

export async function completeProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim(), profileCompleted: true },
    });

    res.status(200).json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}
