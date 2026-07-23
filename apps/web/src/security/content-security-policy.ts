const safeOrigin = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.username || url.password || !['http:', 'https:'].includes(url.protocol)) {
      return undefined;
    }
    return url.origin;
  } catch {
    return undefined;
  }
};

export interface CspConfiguration {
  development: boolean;
  apiOrigin?: string | undefined;
  mediaOrigin?: string | undefined;
  lanHost?: string | undefined;
  webPort?: number | undefined;
  apiPort?: number | undefined;
  objectStoragePort?: number | undefined;
}

/** Server-owned CSP builder. Values are validated origins, never request input. */
export function buildContentSecurityPolicy(nonce: string, config: CspConfiguration): string {
  const imageOrigins = new Set<string>(["'self'", 'blob:', 'data:']);
  const connectOrigins = new Set<string>(["'self'"]);
  const configured = [safeOrigin(config.apiOrigin), safeOrigin(config.mediaOrigin)].filter(
    (origin): origin is string => Boolean(origin),
  );
  for (const origin of configured) {
    imageOrigins.add(origin);
    connectOrigins.add(origin);
  }
  if (config.development) {
    const apiPort = config.apiPort ?? 3001;
    const webPort = config.webPort ?? 3000;
    const storagePort = config.objectStoragePort ?? 9000;
    imageOrigins.add('http://localhost:3001');
    const hosts = ['localhost', '127.0.0.1', safeLanHost(config.lanHost)].filter(
      (host): host is string => Boolean(host),
    );
    for (const host of hosts) {
      imageOrigins.add(`http://${host}:${String(apiPort)}`);
      imageOrigins.add(`http://${host}:${String(storagePort)}`);
      connectOrigins.add(`http://${host}:${String(apiPort)}`);
      connectOrigins.add(`http://${host}:${String(storagePort)}`);
      connectOrigins.add(`ws://${host}:${String(webPort)}`);
    }
  }
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${config.development ? " 'unsafe-eval'" : ''}`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    `img-src ${[...imageOrigins].join(' ')}`,
    "font-src 'self'",
    `connect-src ${[...connectOrigins].join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (configured.every((origin) => origin.startsWith('https://'))) {
    directives.push('upgrade-insecure-requests');
  }
  return directives.join('; ');
}

function safeLanHost(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const parsed = new URL(`http://${value}`);
    return parsed.hostname === value.toLowerCase() && parsed.port === ''
      ? parsed.hostname
      : undefined;
  } catch {
    return undefined;
  }
}
