import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import BackofficeProviders from './providers';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic']
});

export const metadata: Metadata = {
  title: { default: 'Rakamir Webstore Admin', template: '%s | Rakamir Webstore Admin' },
  description: 'Rakamir Webstore backoffice administration panel.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={playfair.className}>
        <BackofficeProviders>{children}</BackofficeProviders>
      </body>
    </html>
  );
}
