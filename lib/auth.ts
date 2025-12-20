import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-me';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Use jose for Edge Runtime compatibility
export async function signToken(payload: any): Promise<string> {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
    return token;
}

export function verifyToken(token: string): any {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('🔓 Token verified successfully:', decoded);
        return decoded;
    } catch (error: any) {
        console.error('❌ Token verification failed:', error.message);
        return null;
    }
}
