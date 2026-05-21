import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Rakamir Webstore — Belanja Online Terpercaya',
    template: '%s | Rakamir Webstore',
  },
  description: 'Temukan ribuan produk berkualitas dengan harga terbaik. Belanja online mudah, cepat, dan terpercaya di Rakamir Webstore.',
  keywords: ['belanja online', 'ecommerce', 'produk terbaik', 'pengiriman cepat'],
  authors: [{ name: 'Rakamir Webstore' }],
  openGraph: {
    title: 'Rakamir Webstore — Belanja Online Terpercaya',
    description: 'Temukan ribuan produk berkualitas dengan harga terbaik.',
    type: 'website',
    locale: 'id_ID',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
