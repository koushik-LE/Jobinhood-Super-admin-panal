import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyToken } from './lib/verifyToken';

export async function middleware(req: NextRequest) {
  const { cookies } = req;
  const token = cookies.get('token')?.value; // Get token from cookies
  const refreshToken = cookies.get('refreshToken')?.value; // Get refreshToken from cookies

  const { pathname, origin } = req.nextUrl;
  const defaultRedirectPath = '/dashboard';

  const protectedPaths = ['/dashboard', '/companies', '/credits']; // Define protected routes
  const isProtectedRoute = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));
  if (!token && refreshToken) {
    const result = await verifyToken(refreshToken);

    if (result.valid && result.refreshed && result.headers?.['Set-Cookie']) {
      const response = NextResponse.next();
      response.headers.set('Set-Cookie', result.headers['Set-Cookie']);
      return response;
    }
  }

  const publicPaths = ['/', '/otpVerification', '/resetPassword', '/password'];
  const isPublicPath = publicPaths.includes(pathname);

  if (!token && !refreshToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL(defaultRedirectPath, req.url));
  }
  if (isProtectedRoute && !token) {
    // If the user is not authenticated, redirect to home ('/')
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next(); // Allow access to the page
}
export const config = {
  matcher: [
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/((?!api/logs|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
