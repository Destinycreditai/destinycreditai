import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, username, password } = await request.json();
        const identifier = email || username;

        console.log('🔐 Login attempt for:', identifier);

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Email/Username and password are required' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            },
        });

        if (!user) {
            console.log('❌ User not found:', identifier);
            return NextResponse.json({ error: 'Email does not exist' }, { status: 401 });
        }

        // Since we added password recently, old users might not have it.
        // Ideally we should handle migration, but for now assuming new flow.
        if (!user.password) {
            console.log('❌ User has no password:', identifier);
            return NextResponse.json({ error: 'Please reset your password' }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            console.log('❌ Invalid password for:', identifier);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Create session token
        const token = await signToken({ userId: user.id, email: user.email, role: user.role });

        console.log('✅ Login successful for:', identifier, 'Role:', user.role);
        console.log('🍪 Setting auth cookie...');

        // Create response first
        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });

        // Set cookie on response
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
            sameSite: 'lax',
        });

        console.log('✅ Cookie set on response');
        return response;
    } catch (error) {
        console.error('❌ Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
