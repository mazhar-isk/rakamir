import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic']
});

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
      <body className={playfair.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
