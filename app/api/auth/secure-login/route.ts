export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * POST /api/auth/secure-login
 * 
 * Secure login endpoint that blocks unpaid users
 * Only allows login for users with ACTIVE status and valid plan
 * 
 * This endpoint ensures that only paid users can access the system
 * by checking both user status and plan information
 * 
 * Expected payload:
 * {
 *   "email": "user@email.com",
 *   "password": "user_password"
 * }
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Secure login attempt for:', email);

    // Validate input - EMAIL and PASSWORD only
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Query user by EMAIL only with active status check
    // After migration, this will check the new 'status' field
    // For now, using the existing 'active' field
    const user = await prisma.user.findFirst({
      where: {
        email,
        // Only allow active users (paid users who have set their password)
        // After schema migration, we'll check status: 'ACTIVE' instead
        active: true,
      },
    });

    // Guard: User not found or not active
    if (!user) {
      console.log('❌ User not found or not active:', email);
      return NextResponse.json(
        { error: 'Invalid credentials or account not activated' },
        { status: 401 }
      );
    }

    // Guard: User has no password (null or undefined)
    if (!user.password || user.password.trim() === '') {
      console.log('❌ User has no password:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Guard: bcrypt comparison with try/catch to prevent crash
    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('❌ bcrypt error:', bcryptError);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!isValid) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Additional security check: Ensure user has a valid plan
    // This prevents users who somehow got active status without payment
    // After migration, this will check the 'plan' field directly
    // For now, we'll use a workaround by checking if the user name contains plan info
    // In the full implementation: if (!user.plan)
    // Temporary check: verify that the user has a plan assigned
    const hasPlan = user.name?.includes('(monthly)') || user.name?.includes('(annual)');
    if (!hasPlan) {
      console.log('❌ User has no plan assigned:', email);
      return NextResponse.json(
        { error: 'Account not properly configured - no plan assigned' },
        { status: 401 }
      );
    }

    // Update last login
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } catch (updateError) {
      console.error('⚠️ Failed to update lastLogin:', updateError);
      // Continue with login even if update fails
    }

    // Guard: JWT secret must exist
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('❌ CRITICAL: JWT_SECRET or NEXTAUTH_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create session token with try/catch
    let token: string;
    try {
      token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          plan: user.name?.includes('(monthly)') ? 'MONTHLY' : user.name?.includes('(annual)') ? 'ANNUAL' : null, // Temporary: extract plan from name field
        },
        jwtSecret,
        { expiresIn: '7d' }
      );
    } catch (jwtError) {
      console.error('❌ JWT signing error:', jwtError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Create response with user data (excluding sensitive info)
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.name?.includes('(monthly)') ? 'MONTHLY' : user.name?.includes('(annual)') ? 'ANNUAL' : null, // Temporary: extract plan from name field
        // Do NOT include password, tokens, or other sensitive data
      },
    });

    // Set auth cookie using NextResponse (not Edge API)
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax', // Standard setting for auth cookies
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    console.log('✅ Secure login successful for:', email);
    return response;
  } catch (error) {
    // NEVER swallow the real error - log it first
    console.error('❌ Secure login error (FULL):', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}