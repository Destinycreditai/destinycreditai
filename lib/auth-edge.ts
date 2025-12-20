// Edge-compatible JWT verification for middleware
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-me';

export async function verifyTokenEdge(token: string): Promise<any> {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        console.log('🔓 Token verified successfully (Edge):', payload);
        return payload;
    } catch (error: any) {
        console.error('❌ Token verification failed (Edge):', error.message);
        return null;
    }
}
