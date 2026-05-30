'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/product/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { PaginatedResponse, Product, useGet } from '@ecommerce/api-client';
import { FavoriteBorder } from '@mui/icons-material';
import { Box, Button, Container, Grid, Skeleton, Typography } from '@mui/material';
import Link from 'next/link';

export default function WishlistPage() {
  const { data, isLoading: isSWRisLoading } = useGet<PaginatedResponse<Product>>('/favorites/products?per_page=50');
  const { favoriteIds, isLoading: isContextLoading } = useWishlist();
  
  // Combine both loadings to prevent flash of empty state
  const isLoading = isSWRisLoading || isContextLoading;
  
  // Filter the SWR fetched products strictly by the currently active context favoriteIds.
  // This makes the UI instantly reactive if the user unfavorites an item while on this page.
  const products = data?.data ?? [];
  const displayedProducts = products.filter(p => favoriteIds.includes(p.id));

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6, minHeight: '60vh' }}>
        <Typography variant="h4" fontWeight={700} mb={1}>Wishlist Saya</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Koleksi produk favorit Anda
        </Typography>

        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Skeleton variant="rounded" height={310} />
              </Grid>
            ))}
          </Grid>
        ) : displayedProducts.length > 0 ? (
          <Grid container spacing={3}>
            {displayedProducts.map((p, i) => (
              <Grid item xs={6} sm={4} md={3} key={p.id}>
                <ProductCard product={p} index={i} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#FAF5F2', borderRadius: 4, border: '1px solid rgba(235,196,184,0.2)' }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(235,196,184,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, color: '#D26B54' }}>
              <FavoriteBorder sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} mb={1}>Wishlist Anda kosong</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Anda belum menambahkan produk apapun ke favorit.
            </Typography>
            <Button component={Link} href="/products" variant="contained" color="primary" sx={{ borderRadius: 2, px: 4 }}>
              Mulai Belanja
            </Button>
          </Box>
        )}
      </Container>
    </StorefrontLayout>
  );
}
