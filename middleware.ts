export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/(pos)/:path*',
    '/api/products/:path*',
    '/api/sales/:path*',
    '/api/dashboard/:path*',
    '/api/import/:path*',
  ],
};