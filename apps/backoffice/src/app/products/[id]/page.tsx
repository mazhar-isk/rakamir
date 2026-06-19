'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { useConfirm } from '@/contexts/ConfirmContext';
import { apiDelete, Product, useGet } from '@ecommerce/api-client';
import { formatCurrency, formatDate } from '@ecommerce/utils';
import {
  ArrowBack,
  Delete,
  Edit,
  Inventory2,
  LocalOffer
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
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import chroma from 'chroma-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const getColorCode = (colorName: string): string => {
  const clean = colorName.trim().toLowerCase();
  const indonesianColors: Record<string, string> = {
    merah: 'red',
    biru: 'blue',
    hijau: 'green',
    kuning: 'yellow',
    hitam: '#1f2937',
    putih: '#ffffff',
    abu: '#9ca3af',
    'abu-abu': '#9ca3af',
    cokelat: '#8c6239',
    coklat: '#8c6239',
    ungu: 'purple',
    oranye: 'orange',
    jingga: 'orange',
    pink: 'pink',
    'merah muda': 'pink',
    emas: '#d4af37',
    perak: '#c0c0c0',
    tembaga: '#b87333',
    tosca: '#30d5c8',
    mocca: '#a38068',
    moka: '#a38068',
    cream: '#fffdd0',
    krim: '#fffdd0',
    mustard: '#e1ad01',
    navy: '#000080',
    maroon: '#800000',
    peach: '#ffe5b4',
    khaki: '#f0e68c',
    denim: '#1560bd',
  };

  if (indonesianColors[clean]) {
    return indonesianColors[clean];
  }

  const parts = clean.split(/\s+/);
  if (parts.length > 1) {
    const baseColor = parts[0];
    const modifier = parts[1];
    const baseEng = indonesianColors[baseColor] || baseColor;

    if (baseEng.startsWith('#')) {
      return baseEng;
    }

    if (modifier === 'tua') {
      if (baseEng === 'purple') return 'indigo';
      return `dark${baseEng}`;
    }
    if (modifier === 'muda') {
      if (baseEng === 'red') return 'lightcoral';
      if (baseEng === 'purple') return 'violet';
      return `light${baseEng}`;
    }
  }

  if (chroma.valid(clean)) {
    return clean;
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const s = 45 + Math.abs((hash >> 8) % 25);
  const l = 40 + Math.abs((hash >> 16) % 20);
  return `hsl(${h}, ${s}%, ${l}%)`;
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: product, isLoading } = useGet<Product>(`/admin/products/${params.id}`);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { confirm } = useConfirm();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Reset image error when selected image index changes
  useEffect(() => {
    setImageError(false);
  }, [selectedImage]);

  // Initialize selected options when product loads
  useEffect(() => {
    if (product?.options && product.options.length > 0) {
      const initial: Record<string, string> = {};
      product.options.forEach((opt) => {
        if (opt.values && opt.values.length > 0) {
          initial[opt.option_id] = opt.values[0].option_value_id;
        }
      });
      setSelectedOptions(initial);
    }
  }, [product]);

  // Resolve active SKU from selected options
  const getActiveSku = () => {
    if (!product || !product.skus || !product.options || product.options.length === 0) return null;
    return product.skus.find((sku) => {
      if (!sku.option_values_map) return false;
      return Object.entries(selectedOptions).every(([optId, valId]) => {
        return sku.option_values_map[optId] === valId;
      });
    }) || null;
  };

  const activeSku = getActiveSku();
  const currentPrice = activeSku ? activeSku.price : (product?.price ?? 0);
  const currentOriginalPrice = activeSku ? activeSku.original_price : product?.original_price;
  const currentStock = activeSku ? activeSku.stock : (product?.stock ?? 0);

  const images = useMemo(() => {
    const productImages = product?.images?.length ? product.images : ['https://picsum.photos/seed/placeholder/400/400'];
    const skuPictures = product?.skus
      ?.map((sku) => sku.image_url)
      .filter((pic): pic is string => !!pic) || [];
    const uniqueSkuPictures = Array.from(new Set(skuPictures)).filter((pic) => !productImages.includes(pic));
    return [...productImages, ...uniqueSkuPictures];
  }, [product]);

  // Synchronize selectedImage when active SKU picture changes (from selector clicks)
  useEffect(() => {
    if (activeSku?.image_url) {
      const idx = images.indexOf(activeSku.image_url);
      if (idx !== -1) {
        setSelectedImage(idx);
      }
    } else {
      setSelectedImage(0);
    }
  }, [activeSku?.image_url, images]);

  // Check if an option value is disabled in the current selection context
  const isOptionValueDisabled = (optionId: string, valueId: string) => {
    if (!product || !product.skus) return false;
    const testSelection = { ...selectedOptions, [optionId]: valueId };
    return !product.skus.some((sku) => {
      if (!sku.option_values_map) return false;
      return (
        sku.stock > 0 &&
        Object.entries(testSelection).every(([oId, vId]) => {
          return sku.option_values_map[oId] === vId;
        })
      );
    });
  };

  const handleOptionChange = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => {
      const next = { ...prev, [optionId]: valueId };
      if (product?.skus) {
        // Check if the new combination matches a SKU
        const sku = product.skus.find((s) =>
          Object.entries(next).every(([oId, vId]) => s.option_values_map?.[oId] === vId)
        );
        if (sku) {
          return next;
        }

        // Auto-correct to the first valid SKU that supports this option value
        const fallbackSku = product.skus.find((s) => s.option_values_map?.[optionId] === valueId);
        if (fallbackSku && fallbackSku.option_values_map) {
          return { ...fallbackSku.option_values_map };
        }
      }
      return next;
    });
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
    const clickedImage = images[index];
    if (product?.skus) {
      const matchingSku = product.skus.find((s) => s.image_url === clickedImage);
      if (matchingSku && matchingSku.option_values_map) {
        setSelectedOptions(matchingSku.option_values_map);
      }
    }
  };

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

  const discountPct = currentOriginalPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : null;

  return (
    <BackofficeLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton component={Link} href="/products"><ArrowBack /></IconButton>
          <Box>
            <Stack direction="row" gap={2} alignItems="center">
              <Typography variant="h5" fontWeight={700}>{product.name}</Typography>
              <Chip label={product.is_active ? "Aktif" : "Tidak Aktif"} size="small" color={product.is_active ? 'success' : 'error'} sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              ID: {product.id}
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
                bgcolor: '#F9F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
              }}
            >
              {imageError || !images[selectedImage] ? (
                <Avatar
                  variant="rounded"
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 0,
                    fontSize: '4rem',
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 700
                  }}
                >
                  {product.name?.[0]?.toUpperCase()}
                </Avatar>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={() => setImageError(true)}
                />
              )}
            </Box>
            {/* Thumbnails */}
            {images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <Avatar
                    key={i}
                    src={img}
                    variant="rounded"
                    onClick={() => handleThumbnailClick(i)}
                    sx={{
                      width: 72, height: 72, cursor: 'pointer',
                      border: i === selectedImage ? '2px solid #D26B54' : '2px solid transparent',
                      transition: 'border-color 0.2s',
                      '&:hover': { borderColor: '#EBC4B8' },
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      fontWeight: 700
                    }}
                  >
                    {product.name?.[0]?.toUpperCase()}
                  </Avatar>
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
                {formatCurrency(currentPrice)}
              </Typography>
              {currentOriginalPrice && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                  >
                    {formatCurrency(currentOriginalPrice)}
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

            {/* Dynamic Option Selectors */}
            {product.options && product.options.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, color: 'text.secondary' }}>
                  Pilihan Varian
                </Typography>
                {product.options.map((opt) => (
                  <Box key={opt.option_id} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.8rem' }}>
                      {opt.name}: <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{opt.values?.find(v => v.option_value_id === selectedOptions[opt.option_id])?.value}</Box>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {opt.values?.map((val) => {
                        const isSelected = selectedOptions[opt.option_id] === val.option_value_id;
                        const isDisabled = isOptionValueDisabled(opt.option_id, val.option_value_id);
                        const isColor = opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'warna';

                        if (isColor) {
                          const hex = getColorCode(val.value);
                          const isLight = chroma.valid(hex) ? chroma(hex).luminance() > 0.5 : false;

                          return (
                            <Box
                              key={val.option_value_id}
                              onClick={() => handleOptionChange(opt.option_id, val.option_value_id)}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                bgcolor: hex,
                                border: isSelected ? '3px solid #D26B54' : (isDisabled ? '1px dashed #E5E7EB' : '1px solid #E5E7EB'),
                                boxShadow: isSelected ? '0 0 6px rgba(210,107,84,0.4)' : 'none',
                                cursor: 'pointer',
                                opacity: isDisabled ? 0.25 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.1s',
                                '&:hover': { transform: 'scale(1.1)' }
                              }}
                            >
                              {isLight && isSelected && (
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#000000' }} />
                              )}
                              {!isLight && isSelected && (
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ffffff' }} />
                              )}
                            </Box>
                          );
                        }

                        return (
                          <Chip
                            key={val.option_value_id}
                            label={val.value}
                            size="small"
                            onClick={() => handleOptionChange(opt.option_id, val.option_value_id)}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: isSelected ? 600 : 400,
                              opacity: isDisabled ? 0.35 : 1,
                              borderStyle: isDisabled ? 'dashed' : 'solid',
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Stock */}
            {[
              { label: 'Stok Tersisa', value: currentStock, chipColor: currentStock < 10 ? 'error' : currentStock < 30 ? 'warning' : 'success' },
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
              { label: 'Kategori', value: (product.categories || []).map((cat) => cat.name).join(', ') || '-' },
              // {
              //   label: 'Rating', value: (
              //     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              //       <Star sx={{ fontSize: 16, color: '#F59E0B' }} />
              //       <Typography fontWeight={600}>{product.rating}</Typography>
              //       <Typography variant="caption" color="text.secondary">({product.review_count} ulasan)</Typography>
              //     </Box>
              //   )
              // },
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
