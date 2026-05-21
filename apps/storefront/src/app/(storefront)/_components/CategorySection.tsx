'use client';

import { Avatar, Box, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';

const categories = [
  { name: 'Elektronik', emoji: '📱', color: '#6C63FF', href: '/products?category=elektronik' },
  { name: 'Fashion', emoji: '👗', color: '#FF6584', href: '/products?category=fashion' },
  { name: 'Rumah', emoji: '🏠', color: '#06B6D4', href: '/products?category=rumah' },
  { name: 'Olahraga', emoji: '⚽', color: '#22C55E', href: '/products?category=olahraga' },
  { name: 'Kesehatan', emoji: '💊', color: '#F59E0B', href: '/products?category=kesehatan' },
  { name: 'Kecantikan', emoji: '💄', color: '#EC4899', href: '/products?category=kecantikan' },
  { name: 'Makanan', emoji: '🍕', color: '#EF4444', href: '/products?category=makanan' },
  { name: 'Lainnya', emoji: '🛍️', color: '#8B5CF6', href: '/products' },
];

export default function CategorySection() {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
          Kategori Pilihan
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={6}>
          Temukan produk sesuai kebutuhan Anda
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          {categories.map((cat, i) => (
            <Grid item xs={3} sm={2} md={1.5} key={cat.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={cat.href}>
                  <Box sx={{ textAlign: 'center', cursor: 'pointer', '&:hover .cat-icon': { transform: 'scale(1.1) translateY(-4px)', boxShadow: `0 8px 24px ${cat.color}44` } }}>
                    <Avatar
                      className="cat-icon"
                      sx={{
                        width: 64, height: 64, mx: 'auto', mb: 1, fontSize: '1.8rem',
                        bgcolor: `${cat.color}18`,
                        border: `2px solid ${cat.color}33`,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {cat.emoji}
                    </Avatar>
                    <Typography variant="caption" fontWeight={600} display="block" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                      {cat.name}
                    </Typography>
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
