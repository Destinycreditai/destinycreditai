import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendInviteEmail } from '@/lib/inviteEmail';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate secure invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiryHours = parseInt(process.env.INVITE_TOKEN_EXPIRY_HOURS || '24');
    const inviteExpiresAt = new Date(Date.now() + tokenExpiryHours * 60 * 60 * 1000);

    // Update user with invite token and expiry
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        inviteToken,
        inviteExpiresAt
      }
    });
    
    console.log('✅ Invite token updated for user:', updatedUser.email, 'Token:', inviteToken);

    // Generate invite link
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.destinycreditai.com';
    const inviteLink = `${frontendUrl}/set-password?token=${inviteToken}`;

    // Send invite email (non-critical operation)
    try {
      await sendInviteEmail({
        email: user.email,
        firstName: user.name?.split(' ')[0] || '',
        token: inviteToken
      });
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
      // Don't fail the request if email fails - user can still use the token
    }

    return NextResponse.json({
      success: true,
      inviteLink
    });
  } catch (error: any) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    );
  }
}