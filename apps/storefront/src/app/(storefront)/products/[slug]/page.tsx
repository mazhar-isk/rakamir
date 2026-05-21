'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useCart } from '@/contexts/CartContext';
import { Product, useGet } from '@ecommerce/api-client';
import { formatCurrency } from '@ecommerce/utils';
import { Add, Favorite, LocalShipping, Remove, Share, Shield, ShoppingCart, SwapHoriz } from '@mui/icons-material';
import { Box, Button, Chip, Container, Divider, Grid, IconButton, Rating, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { data: product, isLoading } = useGet<Product>(`/products/${params.slug}`);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [tab, setTab] = useState(0);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, qty);
      toast.success('Produk berhasil ditambahkan ke keranjang!');
    }
  };

  if (isLoading) {
    return (
      <StorefrontLayout>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}><Skeleton variant="rounded" height={480} /></Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rounded" height={120} sx={{ mt: 3 }} />
            </Grid>
          </Grid>
        </Container>
      </StorefrontLayout>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : ['/placeholder-product.jpg'];

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Images */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Box sx={{ position: 'relative', height: 480, borderRadius: 3, overflow: 'hidden', bgcolor: '#F8F9FC', mb: 2 }}>
                <Image src={images[selectedImage]} alt={product.name} fill style={{ objectFit: 'contain' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <Box key={i} onClick={() => setSelectedImage(i)} sx={{ position: 'relative', width: 72, height: 72, borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: selectedImage === i ? '2px solid #6C63FF' : '2px solid transparent', cursor: 'pointer', bgcolor: '#F8F9FC' }}>
                    <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Info */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {product.is_new && <Chip label="Baru" color="primary" size="small" />}
                {product.discount_percentage && <Chip label={`-${product.discount_percentage}%`} color="error" size="small" />}
                <Chip label={product.category.name} variant="outlined" size="small" />
              </Box>
              <Typography variant="h4" fontWeight={700} mb={1}>{product.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Rating value={product.rating} precision={0.5} size="small" readOnly />
                <Typography variant="body2" color="text.secondary">({product.review_count} ulasan) · {product.sold_count} terjual</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                <Typography variant="h3" fontWeight={800} color="primary.main">{formatCurrency(product.price)}</Typography>
                {product.original_price && (
                  <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through', fontWeight: 400 }}>
                    {formatCurrency(product.original_price)}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Quantity */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Typography fontWeight={600}>Jumlah:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                  <IconButton onClick={() => setQty(Math.max(1, qty - 1))} size="small"><Remove fontSize="small" /></IconButton>
                  <Typography sx={{ px: 3, minWidth: 40, textAlign: 'center', fontWeight: 600 }}>{qty}</Typography>
                  <IconButton onClick={() => setQty(Math.min(product.stock, qty + 1))} size="small"><Add fontSize="small" /></IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">Stok: {product.stock}</Typography>
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button variant="contained" size="large" startIcon={<ShoppingCart />} onClick={handleAddToCart} fullWidth
                  sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', py: 1.5 }}>
                  Tambah ke Keranjang
                </Button>
                <IconButton sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}><Favorite /></IconButton>
                <IconButton sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}><Share /></IconButton>
              </Box>

              {/* Guarantees */}
              <Box sx={{ bgcolor: '#F8F9FC', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[{ Icon: LocalShipping, text: 'Gratis ongkir untuk pembelian di atas Rp 100.000' },
                { Icon: Shield, text: 'Garansi uang kembali 7 hari' },
                { Icon: SwapHoriz, text: 'Penukaran barang mudah' }].map(({ Icon, text }) => (
                  <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Icon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="caption" color="text.secondary">{text}</Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ mt: 8 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #E5E7EB', mb: 4 }}>
            <Tab label="Deskripsi" />
            <Tab label="Ulasan" />
          </Tabs>
          {tab === 0 && (
            <Typography color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>
              {product.description}
            </Typography>
          )}
          {tab === 1 && (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <Rating value={product.rating} precision={0.5} readOnly size="large" sx={{ mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>{product.rating.toFixed(1)} / 5</Typography>
              <Typography variant="body2">Berdasarkan {product.review_count} ulasan</Typography>
            </Box>
          )}
        </Box>
      </Container>
    </StorefrontLayout>
  );
}
