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

// Check if user has valid subscription based on role
// ADMIN users bypass subscription checks
// USER users must have valid plan and status
export function hasValidSubscription(user: any): boolean {
    // ADMIN users always have access
    if (user.role === 'ADMIN') {
        return true;
    }
    
    // For USER role, check subscription requirements
    if (user.role === 'USER') {
        // Check if user has a valid plan
        const hasPlan = user.plan || user.name?.includes('(monthly)') || user.name?.includes('(annual)');
        
        // Check if user has active status
        const isActive = user.status === 'ACTIVE';
        
        // Check if user is active (boolean)
        const isActiveBoolean = user.active === true;
        
        return hasPlan && isActive && isActiveBoolean;
    }
    
    return false;
}
