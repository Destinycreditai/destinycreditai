export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendInviteEmail } from '@/lib/inviteEmail'; // Helper function for sending invite emails

// Product to plan mapping - internal mapping to prevent Zapier from sending wrong data
// This is a security measure to ensure only valid plans are assigned
const PRODUCT_PLAN_MAPPING: Record<string, string> = {
  'DCA_MONTHLY': 'MONTHLY',
  'DCA_ANNUAL': 'ANNUAL',
};

/**
 * POST /api/zapier/create-user
 * 
 * Secure webhook endpoint for Zapier to create users after purchase
 * 
 * SECURITY: Requires Authorization: Bearer ZAPIER_SECRET_KEY header
 * 
 * Expected payload from Zapier:
 * {
 *   "email": "user@email.com",
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "product_id": "DCA_MONTHLY"
 * }
 */
export async function POST(request: Request) {
  try {
    console.log('📥 Zapier webhook received');

    // 1. Verify Zapier secret from Authorization header
    // This is CRITICAL - prevents unauthorized access to create users
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid Authorization header');
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const providedSecret = authHeader.substring(7); // Remove 'Bearer ' prefix
    const expectedSecret = process.env.ZAPIER_SECRET_KEY;

    if (!expectedSecret || providedSecret !== expectedSecret) {
      console.log('❌ Invalid Zapier secret key');
      return NextResponse.json(
        { error: 'Unauthorized: Invalid secret key' },
        { status: 401 }
      );
    }

    // 2. Parse and validate payload
    const body = await request.json();
    const { email, first_name, last_name, product_id } = body;

    // Validate required fields
    if (!email || !first_name || !last_name || !product_id) {
      console.log('❌ Missing required fields:', { email: !!email, first_name: !!first_name, last_name: !!last_name, product_id: !!product_id });
      return NextResponse.json(
        { error: 'Missing required fields: email, first_name, last_name, product_id' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 3. Map product_id to internal plan (security: don't trust Zapier input)
    const plan = PRODUCT_PLAN_MAPPING[product_id];
    if (!plan) {
      console.log('❌ Invalid product_id:', product_id);
      return NextResponse.json(
        { error: 'Invalid product_id' },
        { status: 400 }
      );
    }

    // 4. Check if user already exists
    let existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user is already active, return success (idempotent operation)
      if (existingUser.active && (existingUser as any).status === 'ACTIVE') {
        console.log('✅ User already exists and active:', email);
        return NextResponse.json({
          message: 'User already exists and active',
          user: { id: existingUser.id, email: existingUser.email }
        });
      }

      // If user is invited (has pending invite), regenerate invite token
      if (!existingUser.active || (existingUser as any).status !== 'ACTIVE') { // User is not active, so we'll update them
        console.log('🔄 Updating existing user:', email);
        
        // Generate new secure invite token
        const newInviteToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiryHours = parseInt(process.env.INVITE_TOKEN_EXPIRY_HOURS || '24');
        const inviteExpiresAt = new Date(Date.now() + tokenExpiryHours * 60 * 60 * 1000);

        const updatedUser = await prisma.user.update({
          where: { email },
          data: {
            plan: plan as any, // Type assertion since Prisma enum matches
            active: false, // User is not active until they set password
            status: 'INVITED', // Set status to invited
            inviteToken: newInviteToken, // Store the invite token
            inviteExpiresAt, // Store expiry time
          } as any,
        });

        // Send new invite email
        try {
          await sendInviteEmail({
            email: updatedUser.email,
            firstName: updatedUser.name?.split(' ')[0] || first_name,
            token: newInviteToken,
          });
        } catch (emailError) {
          console.error('❌ Failed to send invite email:', emailError);
          // Don't fail the request if email fails - user can still use the token
        }

        return NextResponse.json({
          message: 'User invite regenerated successfully',
          user: { id: updatedUser.id, email: updatedUser.email }
        });
      }
    }

    // 5. Create new user with invited status
    // Generate secure invite token using crypto
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiryHours = parseInt(process.env.INVITE_TOKEN_EXPIRY_HOURS || '24');
    const inviteExpiresAt = new Date(Date.now() + tokenExpiryHours * 60 * 60 * 1000);

    const fullName = `${first_name} ${last_name}`.trim();

    const newUser = await prisma.user.create({
      data: {
        email,
        name: fullName,
        plan: plan as any, // Type assertion since Prisma enum matches
        active: false, // User starts as inactive (no password yet)
        status: 'INVITED', // User starts as invited (no password yet)
        inviteToken, // Store the invite token
        inviteExpiresAt, // Store expiry time
        // password remains null until user sets it
      } as any,
    });

    // Send invite email with secure link
    try {
      await sendInviteEmail({
        email: newUser.email,
        firstName: first_name,
        token: inviteToken,
      });
    } catch (emailError) {
      console.error('❌ Failed to send invite email:', emailError);
      // Don't fail the request if email fails - user can still use the token
    }

    console.log('✅ Created new user via Zapier:', email);

    // 6. Send invite email with secure link
    try {
      await sendInviteEmail({
        email: newUser.email,
        firstName: first_name,
        token: inviteToken,
      });
    } catch (emailError) {
      console.error('❌ Failed to send invite email:', emailError);
      // Don't fail the request if email fails - user can still use the token
    }

    // 7. Return success response
    return NextResponse.json({
      message: 'User created successfully',
      user: { id: newUser.id, email: newUser.email }
    });

  } catch (error) {
    console.error('❌ Zapier webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}