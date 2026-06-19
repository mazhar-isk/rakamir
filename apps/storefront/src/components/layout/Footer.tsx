'use client';

import { Instagram } from '@mui/icons-material';
import { Box, Container, Divider, Grid, IconButton, Typography } from '@mui/material';
import Link from 'next/link';
import { TikTok } from '../atoms/Icons';

const socialMedia = [
  { icon: Instagram, href: 'https://www.instagram.com/rakamir__/', ariaLabel: 'Instagram' },
  // { icon: YouTube, href: 'https://www.youtube.com/@rakamir', ariaLabel: 'YouTube' },
  // { icon: Facebook, href: 'https://www.facebook.com/rakamir.id/', ariaLabel: 'Facebook' },
  // { icon: Twitter, href: 'https://twitter.com/rakamir', ariaLabel: 'Twitter' },
  { icon: TikTok, href: 'https://www.tiktok.com/@rakamirr.store', ariaLabel: 'TikTok' },
];

const footerLinks = {
  'Belanja': [
    { label: 'Semua Produk', href: '/products' },
    { label: 'Produk Terbaru', href: '/products?filter=new' },
    { label: 'Penawaran Spesial', href: '/products?filter=promo' },
  ],
  'Akun': [
    { label: 'Profil Saya', href: '/account/profile' },
    { label: 'Pesanan Saya', href: '/account/orders' },
  ],
  'Bantuan': [
    { label: 'Pertanyaan Umum (FAQ)', href: '#' },
    { label: 'Kebijakan Privasi', href: '#' },
    { label: 'Syarat & Ketentuan', href: '#' },
  ],
};

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1E1A18',
        color: '#EADFDC',
        pt: 10,
        pb: 6,
        mt: 'auto',
        borderTop: '1px solid rgba(235, 196, 184, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* Brand */}
          <Grid item xs={12} md={5} sx={{ pr: { md: 6 } }}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #D26B54 0%, #EBC4B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                fontFamily: '"Playfair Display", serif',
                letterSpacing: '-0.02em',
                fontSize: '1.4rem'
              }}
            >
              Rakamir
            </Typography>
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.8,
                mb: 4,
                color: '#A2928C',
                maxWidth: 380,
                fontSize: '0.875rem'
              }}
            >
              Destinasi pilihan untuk koleksi tas wanita premium, produk kulit berkualitas tinggi, dan aksesoris fashion elegan yang menunjang gaya hidup modern Anda.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialMedia.map((socialMedia, i) => (
                <IconButton
                  key={i}
                  sx={{
                    color: '#A2928C',
                    bgcolor: 'rgba(235,196,184,0.05)',
                    '&:hover': {
                      color: '#FFFFFF',
                      bgcolor: '#D26B54'
                    },
                    transition: 'all 0.25s',
                    width: 36,
                    height: 36
                  }}
                  component={Link}
                  href={socialMedia.href}
                  aria-label={socialMedia.ariaLabel}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <socialMedia.icon />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid item xs={6} sm={4} md={2.3} key={title}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                gutterBottom
                sx={{
                  mb: 3,
                  color: '#FFFFFF',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem'
                }}
              >
                {title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{ textDecoration: 'none' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#A2928C',
                        fontSize: '0.85rem',
                        transition: 'color 0.2s',
                        '&:hover': { color: '#EBC4B8' }
                      }}
                    >
                      {link.label}
                    </Typography>
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(235, 196, 184, 0.08)', my: 6 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#82746E' }} suppressHydrationWarning>
            © {new Date().getFullYear()} Rakamir. Semua hak cipta dilindungi.
          </Typography>
          <Typography variant="caption" sx={{ color: '#82746E', display: 'flex', gap: 3 }}>
            <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Syarat Layanan</Link>
            <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Kebijakan Privasi</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
