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
    <Box sx={{ py: 8, bgcolor: '#F8F9FC' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <TrendingUp sx={{ color: '#F59E0B' }} />
              <Typography variant="h4" fontWeight={700}>Terlaris</Typography>
              <Chip label="🔥 Hot" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706' }} />
            </Box>
            <Typography variant="body1" color="text.secondary">Produk paling banyak dibeli oleh pelanggan kami</Typography>
          </Box>
          <Button component={Link} href="/products?sort=sold_count" variant="outlined" size="small" sx={{ display: { xs: 'none', sm: 'flex' } }}>
            Lihat Semua
          </Button>
        </Box>

        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={6} md={3} key={i}><Skeleton variant="rounded" height={300} /></Grid>
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
