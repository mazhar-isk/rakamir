'use client';

import { Facebook, Instagram, Twitter, YouTube } from '@mui/icons-material';
import { Box, Container, Divider, Grid, IconButton, Typography } from '@mui/material';
import Link from 'next/link';

const footerLinks = {
  'Belanja': [
    { label: 'Semua Produk', href: '/products' },
    { label: 'Produk Baru', href: '/products?filter=new' },
    { label: 'Promo', href: '/products?filter=promo' },
  ],
  'Akun': [
    { label: 'Profil Saya', href: '/account/profile' },
    { label: 'Pesanan Saya', href: '/account/orders' },
  ],
  'Bantuan': [
    { label: 'FAQ', href: '#' },
    { label: 'Kebijakan Privasi', href: '#' },
    { label: 'Syarat & Ketentuan', href: '#' },
  ],
};

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #F9F6F2 0%, #f5ebe5 60%, #EBC4B8 100%)',
        // color: 'white',
        pt: 8, pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2 }}>
              Rakamir Webstore
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 3 }}>
              Belanja online mudah, cepat, dan terpercaya. Ribuan produk pilihan hadir untuk Anda.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[Instagram, YouTube, Twitter, Facebook].map((Icon, i) => (
                <IconButton key={i} sx={{ '&:hover': { color: '#6C63FF', bgcolor: 'rgba(108,99,255,0.1)' } }}>
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid item xs={6} md={2} key={title}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                {title}
              </Typography>
              {links.map((link) => (
                <Box key={link.href} component={Link} href={link.href} display="block" mb={1}>
                  <Typography variant="body2" sx={{ '&:hover': { color: '#6C63FF' } }}>
                    {link.label}
                  </Typography>
                </Box>
              ))}
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />
        <Typography variant="body2" align="center" suppressHydrationWarning>
          © {new Date().getFullYear()} Rakamir. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
