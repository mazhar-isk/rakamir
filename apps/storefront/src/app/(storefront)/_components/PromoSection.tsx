'use client';

import { ArrowForward, LocalOffer } from '@mui/icons-material';
import { Box, Button, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PromoSection() {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #EBC4B8 20%, #F9F6F2 50%, #EBC4B8 80%)',
              borderRadius: 4,
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative circles */}
            {[{ top: -40, right: -40, size: 160 }, { bottom: -60, left: -60, size: 200 }].map((c, i) => (
              <Box key={i} sx={{ position: 'absolute', ...c, width: c.size, height: c.size, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
            ))}

            <LocalOffer sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h3" fontWeight={800} mb={2}>
              Diskon Hingga 70%!
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 400 }}>
              Jangan lewatkan promo spesial kami. Penawaran terbatas untuk produk pilihan terbaik.
            </Typography>
            <Button
              component={Link}
              href="/products?filter=promo"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ bgcolor: 'white', color: '#6C63FF', fontWeight: 700, px: 5, py: 1.5, '&:hover': { bgcolor: '#F3F4F6', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } }}
            >
              Klaim Promo Sekarang
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
