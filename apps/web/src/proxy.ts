import { NextResponse, type NextRequest } from 'next/server';
import { buildContentSecurityPolicy } from './security/content-security-policy';

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const development =
    process.env.NODE_ENV === 'development' || process.env.LOCAL_DEVELOPMENT === 'true';
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce, {
    development,
    apiOrigin:
      process.env.NEXO_PUBLIC_API_ORIGIN ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_URL,
    mediaOrigin: process.env.NEXO_PUBLIC_MEDIA_ORIGIN ?? process.env.NEXT_PUBLIC_OBJECT_STORAGE_URL,
    lanHost: process.env.DEV_LAN_HOST,
    webPort: Number(process.env.DEV_WEB_PORT ?? 3000),
    apiPort: Number(process.env.DEV_API_PORT ?? 3001),
    objectStoragePort: Number(process.env.DEV_OBJECT_STORAGE_PORT ?? 9000),
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
