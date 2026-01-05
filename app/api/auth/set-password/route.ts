export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

/**
 * POST /api/auth/set-password
 * 
 * Endpoint for invited users to set their password using a token
 * This endpoint handles the secure password setup flow for users created via Zapier
 * 
 * Expected payload:
 * {
 *   "token": "invite_token_from_email",
 *   "password": "SecurePassword123!"
 * }
 */
export async function POST(request: Request) {
  try {
    console.log('🔐 Password setup attempt received');
    
    const body = await request.json();
    const { token, password } = body;

    // Validate input
    if (!token || !password) {
      console.log('❌ Missing token or password');
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('❌ Password does not meet requirements');
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, and number' },
        { status: 400 }
      );
    }

    // Find user by invite token
    // Using type assertion since the Prisma client types may need refresh
    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
      } as any,
    });

    if (!user) {
      console.log('❌ Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const userWithToken = user as any;
    if (userWithToken.inviteExpiresAt && new Date() > new Date(userWithToken.inviteExpiresAt)) {
      console.log('❌ Token has expired');
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user: set password, activate account, clear token
    // Using type assertion for the update operation
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        active: true, // User is now active
        status: 'ACTIVE', // Update status to active
        inviteToken: null, // Clear the invite token to prevent reuse
        inviteExpiresAt: null, // Clear expiry
      } as any,
    });

    console.log('✅ Password set successfully for user:', user.email);

    return NextResponse.json({
      message: 'Password set successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      }
    });

  } catch (error) {
    console.error('❌ Password setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}