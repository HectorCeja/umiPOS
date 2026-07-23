'use client';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
let refreshFlight: Promise<boolean> | null = null;

export function csrfToken() {
  if (typeof document === 'undefined') return '';
  return decodeURIComponent(
    document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('nexo_csrf='))
      ?.slice('nexo_csrf='.length) ?? '',
  );
}

export async function refreshSession() {
  refreshFlight ??= fetch(browserReachableUrl(`${apiBase}/v1/auth/refresh`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'x-csrf-token': csrfToken() },
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshFlight = null;
    });
  return refreshFlight;
}

export async function apiFetch(input: string | URL, init: RequestInit = {}) {
  const reachable = browserReachableUrl(input);
  const first = await fetch(reachable, withCurrentCsrf(init));
  if (first.status !== 401 || input.toString().endsWith('/v1/auth/refresh')) return first;
  if (!(await refreshSession())) return first;
  return fetch(reachable, withCurrentCsrf(init));
}

/** Mirrors API revocation by deleting host-only cookies from the Web origin before navigation. */
export async function clearBrowserSessionCookies() {
  const response = await fetch('/api/auth/cookies', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Browser session cookies could not be cleared');
  await response.text();
}

export function browserReachableUrl(input: string | URL) {
  if (typeof window === 'undefined') return input;
  const value = new URL(input.toString(), window.location.origin);
  if (
    ['localhost', '127.0.0.1'].includes(value.hostname) &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname)
  ) {
    value.hostname = window.location.hostname;
  }
  return value.toString();
}

/** UUID v4 compatible with Chromium local-LAN HTTP origins. */
export function browserUuid() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function withCurrentCsrf(init: RequestInit): RequestInit {
  const headers = new Headers(init.headers);
  if (headers.has('x-csrf-token')) headers.set('x-csrf-token', csrfToken());
  return { ...init, credentials: 'include', headers };
}
