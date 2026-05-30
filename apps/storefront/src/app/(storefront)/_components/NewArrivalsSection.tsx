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
    <Box sx={{ py: 10, bgcolor: '#F9F6F2' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 6 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <NewReleases sx={{ color: '#D26B54', fontSize: 20 }} />
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
                New Arrivals
              </Typography>
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
              Produk Terbaru
            </Typography>
          </Box>
          <Button 
            component={Link} 
            href="/products?filter=new" 
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
            ? Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Skeleton variant="rounded" height={320} sx={{ borderRadius: '16px' }} />
              </Grid>
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
