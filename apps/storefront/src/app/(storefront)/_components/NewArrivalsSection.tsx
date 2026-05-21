'use client';

import ProductCard from '@/components/product/ProductCard';
import { PaginatedResponse, Product, useGet } from '@ecommerce/api-client';
import { NewReleases } from '@mui/icons-material';
import { Box, Button, Container, Grid, Skeleton, Typography } from '@mui/material';
import Link from 'next/link';

export default function NewArrivalsSection() {
  const { data, isLoading } = useGet<PaginatedResponse<Product>>('/products?is_new=true&per_page=8');
  const products = data?.data ?? [];

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <NewReleases sx={{ color: '#FF6584' }} />
              <Typography variant="h4" fontWeight={700}>Produk Terbaru</Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">Koleksi terbaru yang baru saja hadir</Typography>
          </Box>
          <Button component={Link} href="/products?filter=new" variant="outlined" size="small" sx={{ display: { xs: 'none', sm: 'flex' } }}>
            Lihat Semua
          </Button>
        </Box>

        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}><Skeleton variant="rounded" height={300} /></Grid>
            ))
            : products.map((p, i) => (
              <Grid item xs={6} sm={4} md={3} key={p.id}>
                <ProductCard product={p} index={i} />
              </Grid>
            ))}
        </Grid>
      </Container>
    </Box>
  );
}
