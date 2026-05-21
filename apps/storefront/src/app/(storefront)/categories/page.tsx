'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PaginatedResponse, Category, useGet } from '@ecommerce/api-client';
import { Box, Container, Grid, Typography, Card, CardMedia, CardContent, Skeleton, CardActionArea } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CategoriesPage() {
  // Using per_page=100 so we get all categories for now
  const { data, isLoading } = useGet<PaginatedResponse<Category>>('/categories?per_page=100');
  const categories = data?.data ?? [];

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={700} mb={1}>Semua Kategori</Typography>
        <Typography variant="body1" color="text.secondary" mb={6}>
          Jelajahi berbagai produk berdasarkan kategori
        </Typography>

        <Grid container spacing={4}>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Skeleton variant="rounded" height={160} />
              </Grid>
            ))
          ) : (
            categories.map((cat, i) => (
              <Grid item xs={6} sm={4} md={3} key={cat.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    sx={{ 
                      borderRadius: 4, 
                      overflow: 'hidden', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardActionArea component={Link} href={`/products?category=${cat.slug}`}>
                      <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                        <CardMedia
                          component="img"
                          image={cat.image || `https://picsum.photos/seed/${cat.slug}/400/300`}
                          alt={cat.name}
                          sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                      </Box>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {cat.name}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </StorefrontLayout>
  );
}
