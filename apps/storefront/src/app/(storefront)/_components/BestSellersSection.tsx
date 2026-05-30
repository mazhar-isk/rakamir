'use client';

import ProductCard from '@/components/product/ProductCard';
import { PaginatedResponse, Product, useGet } from '@ecommerce/api-client';
import { TrendingUp } from '@mui/icons-material';
import { Box, Button, Chip, Container, Grid, Skeleton, Typography } from '@mui/material';
import Link from 'next/link';

export default function BestSellersSection() {
  const { data, isLoading } = useGet<PaginatedResponse<Product>>('/products?sort=sold_count&per_page=4');
  const products = data?.data ?? [];

  return (
    <Box sx={{ py: 10, bgcolor: '#F9F6F2', borderTop: '1px solid rgba(235, 196, 184, 0.2)' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 6 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUp sx={{ color: '#D26B54', fontSize: 20 }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#D26B54', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em', 
                  fontSize: '0.75rem'
                }}
              >
                Top Seller
              </Typography>
              <Chip 
                label="🔥 POPULAR" 
                size="small" 
                sx={{ 
                  bgcolor: '#FDF5F2', 
                  color: '#D26B54',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  height: 20,
                  borderRadius: '6px'
                }} 
              />
            </Box>
            <Typography 
              variant="h4" 
              fontWeight={700}
              sx={{ 
                color: '#2E2A27', 
                fontFamily: '"Outfit", "Inter", sans-serif',
                letterSpacing: '-0.02em'
              }}
            >
              Terlaris
            </Typography>
          </Box>
          <Button 
            component={Link} 
            href="/products?sort=sold_count" 
            variant="outlined" 
            size="medium" 
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              borderColor: '#EBC4B8',
              color: '#D26B54',
              borderRadius: '10px',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: '#D26B54',
                bgcolor: 'rgba(210, 107, 84, 0.04)'
              }
            }}
          >
            Lihat Semua
          </Button>
        </Box>

        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Skeleton variant="rounded" height={320} sx={{ borderRadius: '16px' }} />
              </Grid>
            ))
            : products.map((p, i) => (
              <Grid item xs={6} md={3} key={p.id}>
                <ProductCard product={p} index={i} />
              </Grid>
            ))}
        </Grid>
      </Container>
    </Box>
  );
}
