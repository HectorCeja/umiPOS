import { type NextRequest, NextResponse } from 'next/server';

const sessionCookies = [
  { name: 'nexo_session', httpOnly: true, secure: false },
  { name: 'nexo_refresh', httpOnly: true, secure: false },
  { name: 'nexo_csrf', httpOnly: false, secure: false },
  { name: '__Host-nexo_session', httpOnly: true, secure: true },
  { name: '__Host-nexo_refresh', httpOnly: true, secure: true },
  { name: '__Host-nexo_csrf', httpOnly: false, secure: true },
] as const;

export function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const configuredOrigins = new Set(
    [
      process.env.NEXO_APP_BASE_URL,
      process.env.NEXT_PUBLIC_WEB_URL,
      process.env.LOCAL_DEVELOPMENT === 'true' ? 'http://localhost:3000' : undefined,
      process.env.LOCAL_DEVELOPMENT === 'true' ? 'http://127.0.0.1:3000' : undefined,
      process.env.LOCAL_DEVELOPMENT === 'true' && process.env.DEV_LAN_HOST
        ? `http://${process.env.DEV_LAN_HOST}:${process.env.DEV_WEB_PORT ?? '3000'}`
        : undefined,
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => new URL(value).origin),
  );
  const fetchSite = request.headers.get('sec-fetch-site');
  if (!origin || !configuredOrigins.has(origin) || (fetchSite && fetchSite !== 'same-origin')) {
    return NextResponse.json({ title: 'Request origin is not allowed' }, { status: 403 });
  }
  const response = NextResponse.json({ status: 'cleared' });
  for (const cookie of sessionCookies) {
    response.cookies.set(cookie.name, '', {
      expires: new Date(0),
      httpOnly: cookie.httpOnly,
      maxAge: 0,
      path: '/',
      sameSite: 'strict',
      secure: cookie.secure,
    });
  }
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
