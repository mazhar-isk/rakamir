'use client';

import { ArrowForward } from '@mui/icons-material';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function PromoSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box sx={{ py: 10, bgcolor: '#FDFBF9' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              background: '#F3EFEA',
              borderRadius: '24px',
              border: '1px solid rgba(235, 196, 184, 0.25)',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 12px 32px rgba(110, 98, 92, 0.03)',
            }}
          >
            <Grid container alignItems="stretch">
              {/* Text Content Column */}
              <Grid 
                item 
                xs={12} 
                md={6} 
                sx={{ 
                  p: { xs: 5, md: 8 }, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'flex-start' 
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#D26B54', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em', 
                    fontSize: '0.75rem',
                    mb: 2,
                    display: 'block'
                  }}
                >
                  END OF SEASON SALE
                </Typography>
                
                <Typography 
                  variant="h3" 
                  fontWeight={700} 
                  sx={{ 
                    color: '#2E2A27', 
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    mb: 2.5
                  }}
                >
                  Koleksi Pilihan,<br />Diskon Hingga 70%
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#6E625C', 
                    lineHeight: 1.8, 
                    mb: 5,
                    fontSize: '0.95rem'
                  }}
                >
                  Sempurnakan penampilan Anda dengan koleksi tas kulit wanita premium kami. Penawaran terbatas untuk item-item kurasi terbaik dengan desain elegan dan pengerjaan halus.
                </Typography>
                
                <Button
                  component={Link}
                  href="/products?filter=promo"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward sx={{ fontSize: 16, transition: 'transform 0.2s' }} className="cta-arrow" />}
                  sx={{
                    px: 5,
                    py: 1.8,
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #D26B54 0%, #EBC4B8 100%)',
                    boxShadow: '0 8px 24px rgba(210,107,84,0.2)',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      boxShadow: '0 12px 30px rgba(210,107,84,0.3)',
                      transform: 'translateY(-2px)',
                      opacity: 0.95,
                      '& .cta-arrow': {
                        transform: 'translateX(4px)'
                      }
                    }
                  }}
                >
                  Klaim Promo Sekarang
                </Button>
              </Grid>

              {/* Image Visual Column */}
              <Grid 
                item 
                xs={12} 
                md={6} 
                sx={{ 
                  position: 'relative', 
                  minHeight: { xs: 300, md: 'auto' },
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      position: { xs: 'relative', md: 'absolute' },
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      minHeight: { xs: 300, md: '100%' },
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <Image
                      src="/assets/images/promo_lifestyle.png"
                      alt="Koleksi Tas Kulit Wanita Premium Rakamir"
                      fill
                      sizes="(max-width: 960px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>

                  {/* Aesthetic Glass Layer on top of image */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to right, rgba(243,239,234,0.15) 0%, rgba(243,239,234,0) 100%)',
                      pointerEvents: 'none'
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
