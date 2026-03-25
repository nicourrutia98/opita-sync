import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from '../src/providers.js';

export const metadata: Metadata = {
  title: 'Opita Sync',
  description: 'Governed enterprise execution console'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="light">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
