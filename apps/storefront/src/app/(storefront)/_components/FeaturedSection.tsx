'use client';

import ProductCard from '@/components/product/ProductCard';
import { PaginatedResponse, Product, useGet } from '@ecommerce/api-client';
import { useIntersection } from '@/hooks/useIntersection';
import { AutoAwesome } from '@mui/icons-material';
import { Box, Container, Grid, Skeleton, Typography } from '@mui/material';

export default function FeaturedSection() {
  const [ref, isIntersecting] = useIntersection();
  const { data, isLoading: apiLoading } = useGet<PaginatedResponse<Product>>(
    isIntersecting ? '/products?is_featured=true&per_page=4' : null
  );
  const products = data?.data ?? [];
  const isLoading = apiLoading || !isIntersecting;

  return (
    <Box ref={ref} sx={{ py: 10, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AutoAwesome sx={{ color: '#D26B54', fontSize: 20 }} />
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
              Curated Collection
            </Typography>
          </Box>
          <Typography 
            variant="h4" 
            fontWeight={700}
            sx={{ 
              color: '#2E2A27', 
              fontFamily: '"Playfair Display", serif',
              letterSpacing: '-0.02em'
            }}
          >
            Koleksi Unggulan
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={340} sx={{ borderRadius: '16px' }} />
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
