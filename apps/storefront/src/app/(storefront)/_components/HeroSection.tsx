'use client';

import { ArrowForward } from '@mui/icons-material';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';



export default function HeroSection() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #F9F6F2 0%, #F5ECE5 50%, #EBC4B8 100%)',
        pt: { xs: 12, md: 8 },
        pb: { xs: 8, md: 8 }
      }}
    >
      {/* Background Soft Blobs */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 300, md: 600 },
          height: { xs: 300, md: 600 },
          borderRadius: '50%',
          background: 'rgba(235, 196, 184, 0.4)',
          filter: 'blur(140px)',
          top: -100,
          left: -100,
          zIndex: 1
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 250, md: 500 },
          height: { xs: 250, md: 500 },
          borderRadius: '50%',
          background: 'rgba(210, 107, 84, 0.15)',
          filter: 'blur(120px)',
          bottom: -100,
          right: -50,
          zIndex: 1
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ width: '100%' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 6, md: 8 }}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Left Content */}
            <Box sx={{ flex: 1.2, maxWidth: { md: 580 }, textAlign: { xs: 'center', md: 'left' } }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Chip
                  label="✨ KOLEKSI MUSIM BARU SUDAH HADIR"
                  sx={{
                    mb: 3,
                    px: 1.5,
                    py: 2,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(235, 196, 184, 0.4)',
                    color: '#7B5E57',
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                    lineHeight: 1.1,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: '#2E2A27',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    mb: 3
                  }}
                >
                  Keanggunan Tanpa{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #D26B54 0%, #EBC4B8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Batas Waktu
                  </Box>
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    lineHeight: 1.8,
                    color: '#6E625C',
                    mb: 5,
                    fontWeight: 400
                  }}
                >
                  Temukan koleksi tas kulit wanita premium berkualitas tinggi — dari hand bag klasik hingga tote bag modern yang fungsional. Dirancang dengan pengerjaan terbaik untuk menunjang keanggunan Anda sehari-hari.
                </Typography>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                >
                  <Button
                    component={Link}
                    href="/products"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                    sx={{
                      px: 4,
                      py: 1.8,
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #D26B54 0%, #EBC4B8 100%)',
                      boxShadow: '0 10px 24px rgba(210, 107, 84, 0.25)',
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 14px 30px rgba(210, 107, 84, 0.35)',
                        opacity: 0.95
                      },
                    }}
                  >
                    Belanja Sekarang
                  </Button>

                  <Button
                    component={Link}
                    href="/products?filter=promo"
                    variant="contained"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.8,
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      bgcolor: '#F5DFD7',
                      color: '#7B5E57',
                      boxShadow: 'none',
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        bgcolor: '#EBC4B8',
                        boxShadow: 'none',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Lihat Promo
                  </Button>
                </Stack>
              </motion.div>

              {/* Minimal Perks */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Stack
                  direction="row"
                  spacing={4}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  sx={{ mt: 6 }}
                >
                  {['👜 Koleksi Terbaru', '✂️ Kualitas Premium', '🚚 Pengiriman Cepat'].map((perk) => (
                    <Typography
                      key={perk}
                      sx={{
                        color: '#7B6E66',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}
                    >
                      {perk}
                    </Typography>
                  ))}
                </Stack>
              </motion.div>
            </Box>

            {/* Right Product Image Visual */}
            <Box
              sx={{
                flex: 0.8,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
                maxHeight: { xs: 400, md: 'none' }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                {/* Floating motion wrap */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: 'easeInOut'
                  }}
                  style={{ position: 'relative', width: '100%', maxWidth: 420 }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '100%', // 1:1 Aspect ratio
                      borderRadius: '32px',
                      overflow: 'hidden',
                      boxShadow: '0 24px 70px rgba(110, 98, 92, 0.12)',
                      border: '1px solid rgba(255,255,255,0.7)',
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    <Image
                      src="/assets/images/hero_product.png"
                      alt="Rakamir Premium Leather Bag Featured"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{ objectFit: 'cover', padding: '16px', borderRadius: '32px' }}
                    />
                  </Box>

                  {/* Decorative Glassmorphic Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -20,
                      left: -20,
                      bgcolor: 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(235, 196, 184, 0.3)',
                      boxShadow: '0 12px 32px rgba(110, 98, 92, 0.08)',
                      borderRadius: '16px',
                      p: 2,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#D26B54', fontWeight: 700, display: 'block', mb: 0.5 }}>
                      KOLEKSI UNGGULAN
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2E2A27', fontWeight: 700 }}>
                      Aura Classic Leather Handbag
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7B6E66' }}>
                      Kulit Asli Premium · Pengerjaan Halus
                    </Typography>
                  </Box>
                </motion.div>
              </motion.div>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}


