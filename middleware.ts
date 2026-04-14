import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const protectedPaths = ['/sales', '/history', '/products', '/dashboard', '/help'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sales/:path*', '/history/:path*', '/products/:path*', '/dashboard/:path*', '/help/:path*'],
};