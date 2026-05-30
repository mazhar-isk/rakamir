'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Product } from '@ecommerce/api-client';
import { formatCurrency } from '@ecommerce/utils';
import { FavoriteBorder, ShoppingCartOutlined, Favorite, Close, Visibility } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Rating, Typography, Dialog, DialogContent, Grid, Button, Fade, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { favoriteIds, toggleFavorite } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isFavorite = favoriteIds.includes(product.id);
  const discountPct = product.discount_percentage;
  const mainImage = product.images?.[0] || '/placeholder-product.jpg';

  const [isHovered, setIsHovered] = useState(false);
  const [openQuickView, setOpenQuickView] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Silakan login terlebih dahulu untuk menyimpan ke favorit.');
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    toggleFavorite(product.id, product.name);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenQuickView(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} ditambahkan ke keranjang!`);
  };

  const handleQuickViewAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} ditambahkan ke keranjang!`);
    setOpenQuickView(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: '100%' }}
      >
        <Card
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(235, 196, 184, 0.15)',
            boxShadow: isHovered
              ? '0 20px 40px rgba(110, 98, 92, 0.08)'
              : '0 8px 24px rgba(110, 98, 92, 0.02)',
            transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {product.is_new && (
              <Chip
                label="NEW"
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  height: 20,
                  bgcolor: '#D26B54',
                  color: '#FFFFFF'
                }}
              />
            )}
            {discountPct && discountPct > 0 && (
              <Chip
                label={`-${discountPct}%`}
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  height: 20,
                  bgcolor: '#EBC4B8',
                  color: '#7B5E57'
                }}
              />
            )}
          </Box>

          {/* Wishlist Icon */}
          <IconButton
            onClick={handleToggleFavorite}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              bgcolor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(235, 196, 184, 0.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              color: isFavorite ? '#D26B54' : '#7B6E66',
              '&:hover': {
                bgcolor: '#FFFFFF',
                color: '#D26B54',
                transform: 'scale(1.08)'
              },
              transition: 'all 0.25s ease'
            }}
            size="small"
          >
            {isFavorite ? <Favorite sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
          </IconButton>

          {/* Image Container with Hover Zoom */}
          <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
            <Box sx={{ position: 'relative', height: 260, bgcolor: '#FDFBF9', overflow: 'hidden' }}>
              <Box
                className="product-image-wrap"
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </Box>

              {/* Floating Action Buttons Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 1.5,
                  display: 'flex',
                  gap: 1,
                  background: 'linear-gradient(to top, rgba(46,42,39,0.2) 0%, rgba(46,42,39,0) 100%)',
                  transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
                  opacity: isHovered ? 1 : 0,
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 3
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleAddToCart}
                  fullWidth
                  size="small"
                  startIcon={<ShoppingCartOutlined sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#D26B54',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    py: 1,
                    borderRadius: '8px',
                    boxShadow: 'none',
                    flex: 2,
                    '&:hover': {
                      bgcolor: '#B5533E',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Beli
                </Button>
                <IconButton
                  onClick={handleQuickView}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#2E2A27',
                    borderRadius: '8px',
                    width: 38,
                    height: 38,
                    '&:hover': {
                      bgcolor: '#FFFFFF',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <Visibility sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          </Link>

          {/* Card Content */}
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 2, pb: '16px !important', px: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#7B6E66',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.65rem',
                mb: 0.5
              }}
            >
              {product.category?.name || 'Kurasi Pilihan'}
            </Typography>

            <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  mb: 1,
                  lineHeight: 1.45,
                  fontSize: '0.875rem',
                  color: '#2E2A27',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#D26B54' }
                }}
              >
                {product.name}
              </Typography>
            </Link>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <Rating value={product.rating || 5} precision={0.5} size="small" readOnly sx={{ fontSize: '0.75rem', color: '#D26B54' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                ({product.review_count || 0})
              </Typography>
            </Box>

            {/* Price Row */}
            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#D26B54" sx={{ fontSize: '0.95rem' }}>
                {formatCurrency(product.price)}
              </Typography>
              {product.original_price && (
                <Typography variant="caption" color="#7B6E66" sx={{ textDecoration: 'line-through', fontSize: '0.75rem' }}>
                  {formatCurrency(product.original_price)}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick View Modal */}
      <Dialog
        open={openQuickView}
        onClose={() => setOpenQuickView(false)}
        maxWidth="md"
        fullWidth
        scroll="body"
        TransitionComponent={Fade}
        transitionDuration={400}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(46, 42, 39, 0.15)',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(235, 196, 184, 0.1)'
          }
        }}
      >
        <IconButton
          onClick={() => setOpenQuickView(false)}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            bgcolor: 'rgba(249, 246, 242, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#7B6E66',
            '&:hover': {
              bgcolor: '#FFFFFF',
              color: '#2E2A27'
            },
            transition: 'all 0.2s'
          }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>

        <DialogContent sx={{ p: 0 }}>
          <Grid container>
            {/* Image Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', height: { xs: 300, md: 450 }, bgcolor: '#FDFBF9' }}>
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 960px) 100vw, 50vw"
                />
              </Box>
            </Grid>

            {/* Info Column */}
            <Grid item xs={12} md={6} sx={{ p: { xs: 4, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#D26B54',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.75rem',
                  mb: 1.5,
                  display: 'block'
                }}
              >
                {product.category?.name || 'Kurasi Pilihan'}
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: '#2E2A27',
                  lineHeight: 1.3,
                  mb: 2,
                  fontFamily: '"Outfit", "Inter", sans-serif'
                }}
              >
                {product.name}
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Rating value={product.rating || 5} precision={0.5} readOnly sx={{ color: '#D26B54', fontSize: '1rem' }} />
                <Typography variant="body2" color="#7B6E66" sx={{ fontSize: '0.8rem' }}>
                  {product.rating || '5.0'} ({product.review_count || 0} Ulasan Pelanggan)
                </Typography>
              </Box>

              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 3 }}>
                <Typography variant="h5" fontWeight={800} color="#D26B54">
                  {formatCurrency(product.price)}
                </Typography>
                {product.original_price && (
                  <Typography variant="body1" color="#7B6E66" sx={{ textDecoration: 'line-through' }}>
                    {formatCurrency(product.original_price)}
                  </Typography>
                )}
              </Box>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: '#6E625C',
                  lineHeight: 1.7,
                  mb: 4,
                  fontSize: '0.875rem'
                }}
              >
                {product.description || 'Produk kurasi terbaik dari koleksi premium kami. Dibuat dengan material berkualitas tinggi untuk menyajikan detail dan kemewahan dalam genggaman Anda.'}
              </Typography>

              {/* CTA Action */}
              <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  onClick={handleQuickViewAddToCart}
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartOutlined />}
                  sx={{
                    bgcolor: '#D26B54',
                    color: '#FFFFFF',
                    py: 1.8,
                    borderRadius: '12px',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(210,107,84,0.2)',
                    '&:hover': {
                      bgcolor: '#B5533E',
                      boxShadow: '0 12px 30px rgba(210,107,84,0.3)',
                    }
                  }}
                >
                  Tambah Ke Keranjang
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setOpenQuickView(false);
                    router.push(`/products/${product.slug}`);
                  }}
                  sx={{
                    borderColor: '#EBC4B8',
                    color: '#D26B54',
                    px: 3,
                    borderRadius: '12px',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#D26B54',
                      bgcolor: 'rgba(210, 107, 84, 0.04)'
                    }
                  }}
                >
                  Detail
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}
