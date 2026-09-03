import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pathforge-super-secret-access-token-key-32-chars-long'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Verify token
  let payload: any = null;
  if (token) {
    try {
      const { payload: decoded } = await jwtVerify(token, JWT_SECRET);
      payload = decoded;
    } catch (err) {
      try {
        payload = decodeJwt(token);
      } catch (decodeErr) {
        // Token is malformed
      }
    }
  }

  // 1. Redirect unauthenticated requests to login
  if (isProtectedRoute && !payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated requests away from auth pages to their dedicated cockpit
  if (isAuthRoute && payload) {
    let target = '/dashboard';
    if (payload.role === 'RECRUITER') target = '/dashboard/recruiter';
    else if (payload.role === 'TPO') target = '/dashboard/tpo';
    else if (payload.role === 'ADMIN') target = '/admin';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Strict Role-Based Route Guards
  if (payload && isProtectedRoute) {
    const userRole = String(payload.role || 'STUDENT');

    // Admin Guard
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      let home = '/dashboard';
      if (userRole === 'RECRUITER') home = '/dashboard/recruiter';
      else if (userRole === 'TPO') home = '/dashboard/tpo';
      return NextResponse.redirect(new URL(home, request.url));
    }

    // Recruiter Portal Guard: ONLY accessible to RECRUITER or ADMIN
    if (pathname.startsWith('/dashboard/recruiter') && userRole !== 'RECRUITER' && userRole !== 'ADMIN') {
      const fallback = userRole === 'TPO' ? '/dashboard/tpo' : '/dashboard';
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    // University TPO Portal Guard: ONLY accessible to TPO or ADMIN
    if (pathname.startsWith('/dashboard/tpo') && userRole !== 'TPO' && userRole !== 'ADMIN') {
      const fallback = userRole === 'RECRUITER' ? '/dashboard/recruiter' : '/dashboard';
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    // Student Cockpit & Tools Guard: Block Recruiters and TPOs from student-specific prep tools
    const isStudentOnlyRoute =
      pathname === '/dashboard' ||
      pathname.startsWith('/dashboard/coding') ||
      pathname.startsWith('/dashboard/roadmap') ||
      pathname.startsWith('/dashboard/ml-tracker') ||
      pathname.startsWith('/dashboard/planner') ||
      pathname.startsWith('/dashboard/projects') ||
      pathname.startsWith('/dashboard/skills') ||
      pathname.startsWith('/dashboard/readiness');

    if (isStudentOnlyRoute) {
      if (userRole === 'RECRUITER') {
        return NextResponse.redirect(new URL('/dashboard/recruiter', request.url));
      }
      if (userRole === 'TPO') {
        return NextResponse.redirect(new URL('/dashboard/tpo', request.url));
      }
    }
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
