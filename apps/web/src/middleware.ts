import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pathforge-super-secret-access-token-key-32-chars-long'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Verify token
  let payload = null;
  if (token) {
    try {
      const { payload: decoded } = await jwtVerify(token, JWT_SECRET);
      payload = decoded;
    } catch (err) {
      // Token is invalid/expired
    }
  }

  // Redirect unauthenticated requests to login
  if (isProtectedRoute && !payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated requests away from auth pages
  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Restrict admin route
  if (pathname.startsWith('/admin') && payload && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Append user metadata headers for layout extraction
  const response = NextResponse.next();
  if (payload) {
    response.headers.set('x-user-id', String(payload.userId));
    response.headers.set('x-user-role', String(payload.role));
  }
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
