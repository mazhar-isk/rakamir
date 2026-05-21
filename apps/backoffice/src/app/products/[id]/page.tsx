'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { apiDelete, Product, useGet } from '@ecommerce/api-client';
import { formatCurrency, formatDate } from '@ecommerce/utils';
import {
  ArrowBack,
  Delete,
  Edit,
  Inventory2,
  LocalOffer,
  Star,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useConfirm } from '@/contexts/ConfirmContext';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: product, isLoading } = useGet<Product>(`/admin/products/${params.id}`);
  const [selectedImage, setSelectedImage] = useState(0);
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Hapus Produk',
      message: `Yakin ingin menghapus "${product?.name}"? Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Ya, Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiDelete(`/admin/products/${params.id}`);
      toast.success('Produk berhasil dihapus.');
      router.push('/products');
    } catch {
      toast.error('Gagal menghapus produk.');
    }
  };

  if (isLoading) {
    return (
      <BackofficeLayout>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </BackofficeLayout>
    );
  }

  if (!product) {
    return (
      <BackofficeLayout>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Inventory2 sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Produk tidak ditemukan</Typography>
          <Button component={Link} href="/products" sx={{ mt: 2 }} startIcon={<ArrowBack />}>Kembali ke Daftar Produk</Button>
        </Box>
      </BackofficeLayout>
    );
  }

  const images = product.images?.length ? product.images : ['https://picsum.photos/seed/placeholder/400/400'];
  const discountPct = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <BackofficeLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton component={Link} href="/products"><ArrowBack /></IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>{product.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              ID: {product.id} · Slug: {product.slug}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            component={Link}
            href={`/products/${params.id}/edit`}
          >
            Edit Produk
          </Button>
          <Tooltip title="Hapus produk ini secara permanen">
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
              Hapus
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* ── Left column ──────────────────────────────────────── */}
        <Grid item xs={12} lg={8}>
          {/* Image gallery */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Foto Produk</Typography>
            {/* Main image */}
            <Box
              sx={{
                width: '100%', height: 340, borderRadius: 3, overflow: 'hidden',
                bgcolor: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[selectedImage]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
            {/* Thumbnails */}
            {images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <Avatar
                    key={i}
                    src={img}
                    variant="rounded"
                    onClick={() => setSelectedImage(i)}
                    sx={{
                      width: 72, height: 72, cursor: 'pointer',
                      border: i === selectedImage ? '2px solid #6C63FF' : '2px solid transparent',
                      transition: 'border-color 0.2s',
                      '&:hover': { borderColor: '#9D97FF' },
                    }}
                  />
                ))}
              </Box>
            )}
          </Card>

          {/* Description */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Deskripsi Produk</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
              {product.description}
            </Typography>

            {product.tags?.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <LocalOffer sx={{ fontSize: 16, color: 'text.secondary' }} />
                  {product.tags.map((tag) => (
                    <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                  ))}
                </Box>
              </>
            )}
          </Card>
        </Grid>

        {/* ── Right column ─────────────────────────────────────── */}
        <Grid item xs={12} lg={4}>
          {/* Pricing card */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Harga & Stok</Typography>

            {/* Price */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {formatCurrency(product.price)}
              </Typography>
              {product.original_price && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                  >
                    {formatCurrency(product.original_price)}
                  </Typography>
                  <Chip
                    label={`-${discountPct}%`}
                    size="small"
                    color="error"
                    sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Stock */}
            {[
              { label: 'Stok Tersisa', value: product.stock, chipColor: product.stock < 10 ? 'error' : product.stock < 30 ? 'warning' : 'success' },
            ].map(({ label, value, chipColor }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Chip
                  label={`${value} unit`}
                  size="small"
                  color={chipColor as 'error' | 'warning' | 'success'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            ))}

            {[
              { label: 'Total Terjual', value: `${product.sold_count} unit` },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography fontWeight={600}>{value}</Typography>
              </Box>
            ))}
          </Card>

          {/* Info card */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Informasi</Typography>
            {[
              { label: 'Kategori', value: product.category?.name ?? '-' },
              { label: 'Rating', value: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star sx={{ fontSize: 16, color: '#F59E0B' }} />
                  <Typography fontWeight={600}>{product.rating}</Typography>
                  <Typography variant="caption" color="text.secondary">({product.review_count} ulasan)</Typography>
                </Box>
              )},
              { label: 'Ditambahkan', value: formatDate(product.created_at) },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography fontWeight={600} component="span">{value}</Typography>
              </Box>
            ))}
          </Card>

          {/* Status badges */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Status</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Featured"
                color={product.is_featured ? 'primary' : 'default'}
                variant={product.is_featured ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label="Produk Baru"
                color={product.is_new ? 'secondary' : 'default'}
                variant={product.is_new ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </BackofficeLayout>
  );
}
