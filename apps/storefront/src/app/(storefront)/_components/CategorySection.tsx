'use client';

import { Box, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';

const categories = [
  { name: 'Kecantikan', subtitle: 'Skincare & Apothecary', num: '01', bg: '#F5DFD7', text: '#7B5E57', href: '/products?category=kecantikan' },
  { name: 'Rumah', subtitle: 'Living & Comfort', num: '02', bg: '#EADFDC', text: '#6B5450', href: '/products?category=rumah' },
  { name: 'Kesehatan', subtitle: 'Wellness & Care', num: '03', bg: '#E5ECE4', text: '#556050', href: '/products?category=kesehatan' },
  { name: 'Fashion', subtitle: 'Apparel & Texture', num: '04', bg: '#EFECE7', text: '#5C5450', href: '/products?category=fashion' },
  { name: 'Elektronik', subtitle: 'Modern Utility', num: '05', bg: '#E5ECEE', text: '#505B60', href: '/products?category=elektronik' },
  { name: 'Olahraga', subtitle: 'Movement & Focus', num: '06', bg: '#ECE6DF', text: '#605B50', href: '/products?category=olahraga' },
  { name: 'Makanan', subtitle: 'Organic Pantry', num: '07', bg: '#F4ECE4', text: '#6E5F50', href: '/products?category=makanan' },
  { name: 'Semua Produk', subtitle: 'Curated Collection', num: '08', bg: '#F9F6F2', text: '#D26B54', href: '/products' },
];

export default function CategorySection() {
  return (
    <Box sx={{ py: 10, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#D26B54', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em', 
              fontSize: '0.75rem',
              mb: 1.5,
              display: 'block'
            }}
          >
            KURASI PILIHAN
          </Typography>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            sx={{ 
              color: '#2E2A27', 
              fontFamily: '"Outfit", "Inter", sans-serif',
              letterSpacing: '-0.02em',
              mb: 2 
            }}
          >
            Jelajahi Berdasarkan Kategori
          </Typography>
          <Typography variant="body1" sx={{ color: '#7B6E66', maxWidth: 500, mx: 'auto', fontSize: '0.95rem' }}>
            Temukan kurasi produk terbaik yang dirancang khusus untuk memperindah rutinitas harian Anda.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {categories.map((cat, i) => (
            <Grid item xs={6} sm={4} md={3} key={cat.name}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%' }}
              >
                <Link href={cat.href} style={{ textDecoration: 'none' }}>
                  <Box 
                    sx={{ 
                      p: 3, 
                      height: '100%', 
                      minHeight: 160,
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      borderRadius: '16px',
                      bgcolor: cat.bg,
                      border: '1px solid rgba(235, 196, 184, 0.15)',
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 30px rgba(110, 98, 92, 0.06)',
                        '& .cat-arrow': {
                          transform: 'translateX(4px)'
                        }
                      }
                    }}
                  >
                    {/* Index Number */}
                    <Typography 
                      sx={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: cat.text, 
                        opacity: 0.5,
                        fontFamily: '"Outfit", sans-serif',
                        letterSpacing: '0.05em' 
                      }}
                    >
                      {cat.num}
                    </Typography>

                    {/* Category Label */}
                    <Box sx={{ mt: 4 }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={700} 
                        sx={{ 
                          color: '#2E2A27', 
                          lineHeight: 1.2,
                          fontSize: '1rem',
                          fontFamily: '"Outfit", "Inter", sans-serif',
                          mb: 0.5
                        }}
                      >
                        {cat.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: cat.text, 
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {cat.subtitle} <span className="cat-arrow" style={{ transition: 'transform 0.25s', display: 'inline-block' }}>→</span>
                      </Typography>
                    </Box>
                  </Box>
                </Link>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
