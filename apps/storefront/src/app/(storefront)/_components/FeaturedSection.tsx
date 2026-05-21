'use client';

import ProductCard from '@/components/product/ProductCard';
import { PaginatedResponse, Product, useGet } from '@ecommerce/api-client';
import { AutoAwesome } from '@mui/icons-material';
import { Box, Container, Grid, Skeleton, Typography } from '@mui/material';

export default function FeaturedSection() {
  const { data, isLoading } = useGet<PaginatedResponse<Product>>('/products?is_featured=true&per_page=4');
  const products = data?.data ?? [];

  return (
    <Box sx={{ py: 8, bgcolor: '#F8F9FC' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AutoAwesome sx={{ color: '#6C63FF' }} />
          <Typography variant="h4" fontWeight={700}>Produk Rekomendasi</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={5}>
          Dipilih khusus untuk Anda berdasarkan tren terkini
        </Typography>

        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={320} />
              </Grid>
            ))
            : products.map((product, i) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <ProductCard product={product} index={i} />
              </Grid>
            ))}
        </Grid>
      </Container>
    </Box>
  );
}
