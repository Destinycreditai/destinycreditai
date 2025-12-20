import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from './lib/auth-edge';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    console.log('🛡️ Middleware:', pathname, 'Token exists:', !!token);
    if (token) {
        console.log('🍪 Token value (first 20 chars):', token.substring(0, 20) + '...');
    }

    // Verify token and get user data
    const payload = token ? await verifyTokenEdge(token) : null;
    
    if (payload) {
        console.log('✅ Token valid. User:', payload.email, 'Role:', payload.role);
    } else if (token) {
        console.log('❌ Token invalid or expired');
    }

    // Protect /admin routes - ADMIN ONLY
    if (pathname.startsWith('/admin')) {
        if (!token || !payload) {
            console.log('🚫 Admin access denied - no auth, redirecting to /login');
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // Check if user is admin
        if (payload.role !== 'ADMIN') {
            console.log('🚫 Admin access denied - user is not admin, redirecting to /dashboard');
            // Non-admin users trying to access admin panel get redirected to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        console.log('✅ Admin access granted');
    }

    // Protect /dashboard routes - any authenticated user
    if (pathname.startsWith('/dashboard')) {
        if (!token || !payload) {
            console.log('🚫 Dashboard access denied - no auth, redirecting to /login');
            return NextResponse.redirect(new URL('/login', request.url));
        }
        console.log('✅ Dashboard access granted');
    }

    // Redirect logged in users away from auth pages
    if (pathname === '/login' || pathname === '/signup') {
        if (token && payload) {
            // Redirect based on role
            if (payload.role === 'ADMIN') {
                console.log('🔄 Logged in admin accessing login page, redirecting to /admin');
                return NextResponse.redirect(new URL('/admin', request.url));
            } else {
                console.log('🔄 Logged in user accessing login page, redirecting to /dashboard');
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    console.log('✅ Middleware passed');
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup'],
};
