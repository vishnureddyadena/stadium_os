import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Stadium OS AI - Smart Stadium Intelligence Platform',
  description: 'One Intelligent Platform for Every FIFA World Cup 2026 Experience.',
  keywords: ['FIFA', 'World Cup 2026', 'Stadium OS', 'GenAI Operations', 'Digital Twin'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
