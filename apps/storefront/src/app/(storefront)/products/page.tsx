'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/product/ProductCard';
import { PaginatedResponse, Product, useGet } from '@ecommerce/api-client';
import { Search } from '@mui/icons-material';
import { Box, Container, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Pagination, Select, Skeleton, TextField, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const queryString = new URLSearchParams({
    page: String(page),
    sort,
    ...(search && { q: search }),
    ...(searchParams.get('category') && { category: searchParams.get('category')! }),
    ...(searchParams.get('filter') && { filter: searchParams.get('filter')! }),
    per_page: '12',
  }).toString();

  const { data, isLoading } = useGet<PaginatedResponse<Product>>(`/products?${queryString}`);
  const products = data?.data ?? [];

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
      <Grid container spacing={3}>
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={"skeleton-" + i}><Skeleton variant="rounded" height={310} /></Grid>
          ))
          : products.map((p, i) => (
            <Grid item xs={6} sm={4} md={3} key={"product-" + p.id + i}>
              <ProductCard product={p} index={i} />
            </Grid>
          ))}
      </Grid>

      {/* Pagination */}
      {data && data.meta.last_page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination count={data.meta.last_page} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
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
