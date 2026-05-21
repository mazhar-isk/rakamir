import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BackofficeProviders from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Rakamir Webstore Admin', template: '%s | Rakamir Webstore Admin' },
  description: 'Rakamir Webstore backoffice administration panel.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <BackofficeProviders>{children}</BackofficeProviders>
      </body>
    </html>
  );
}
