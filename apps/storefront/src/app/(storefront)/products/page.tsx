'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/product/ProductCard';
import { PaginatedResponse, Product, useGet } from '@ecommerce/api-client';
import { useIntersection } from '@/hooks/useIntersection';
import { Search } from '@mui/icons-material';
import { Box, Container, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, Skeleton, TextField, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [search, setSearch] = useState(searchParams.get('search') || searchParams.get('q') || '');

  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const queryString = new URLSearchParams({
    page: String(page),
    sort,
    ...(search && { search: search }),
    ...(searchParams.get('category') && { category: searchParams.get('category')! }),
    ...(searchParams.get('filter') && { filter: searchParams.get('filter')! }),
    per_page: '12',
  }).toString();

  const { data, isLoading } = useGet<PaginatedResponse<Product>>(`/products?${queryString}`);

  const [loadMoreRef, isLoadMoreVisible] = useIntersection({ once: false, rootMargin: '100px' });

  // Reset products list and page when filters/search changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
  }, [sort, search, searchParams]);

  // Append items when data changes
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setProducts(data.data);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts = data.data.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
      setHasMore(page < data.meta.last_page);
    }
  }, [data, page]);

  // Load next page when sentinel is visible
  useEffect(() => {
    if (isLoadMoreVisible && hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [isLoadMoreVisible, hasMore, isLoading]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Semua Produk</Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        {data?.meta.total ?? 0} produk ditemukan
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          size="small"
          sx={{ minWidth: 240 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Urutkan</InputLabel>
          <Select value={sort} label="Urutkan" onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <MenuItem value="newest">Terbaru</MenuItem>
            <MenuItem value="price_asc">Harga: Terendah</MenuItem>
            <MenuItem value="price_desc">Harga: Tertinggi</MenuItem>
            <MenuItem value="sold_count">Terlaris</MenuItem>
            <MenuItem value="rating">Rating Terbaik</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Products Grid */}
      {products.length === 0 && isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={"skeleton-initial-" + i}><Skeleton variant="rounded" height={310} /></Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#FAF8F6', borderRadius: 4, border: '1px dashed rgba(235,196,184,0.4)', maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Typography fontSize={48} mb={2}>🔍</Typography>
          <Typography variant="h6" fontWeight={700} mb={1}>Produk Tidak Ditemukan</Typography>
          <Typography color="text.secondary">Maaf, kami tidak menemukan produk yang cocok dengan pencarian atau filter Anda.</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.map((p, i) => (
              <Grid item xs={6} sm={4} md={3} key={"product-" + p.id + i}>
                <ProductCard product={p} index={i} />
              </Grid>
            ))}
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={"skeleton-more-" + i}><Skeleton variant="rounded" height={310} /></Grid>
            ))}
          </Grid>

          {hasMore && (
            <Box ref={loadMoreRef} sx={{ display: 'flex', justifyContent: 'center', py: 4, mt: 2, minHeight: '20px' }}>
              {isLoading && <Skeleton variant="rounded" height={40} width={200} />}
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default function ProductsPage() {
  return (
    <StorefrontLayout>
      <Suspense fallback={
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={400} />
        </Container>
      }>
        <ProductsContent />
      </Suspense>
    </StorefrontLayout>
  );
}
