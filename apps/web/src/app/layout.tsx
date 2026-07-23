import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import '@nexo/ui/styles.css';
import './styles.css';
import './optical-layout.css';
import './immersion-layout.css';
import './owner-master-pass-2b.css';
import { IdentityProvider } from './identity-provider';

export const metadata: Metadata = {
  title: 'NEXO — Tu negocio, en claro',
  description: 'Ventas, caja e inventario conectados para administrar tu negocio.',
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Reading the per-request headers opts the shell into dynamic rendering so
  // Next can propagate the CSP nonce created by proxy.ts to every script tag.
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="es-MX" data-theme="dark">
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.setItem('nexo-theme','dark');document.documentElement.dataset.theme='dark'}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <IdentityProvider>{children}</IdentityProvider>
      </body>
    </html>
  );
}
