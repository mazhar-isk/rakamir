'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Product } from '@ecommerce/api-client';
import { formatCurrency } from '@ecommerce/utils';
import { FavoriteBorder, ShoppingCartOutlined, Favorite } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Rating, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card
        className="product-card"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&:hover .add-to-cart': { opacity: 1, transform: 'translateY(0)' },
        }}
      >
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {product.is_new && <Chip label="Baru" size="small" color="primary" sx={{ fontSize: '0.7rem', height: 22 }} />}
          {discountPct && discountPct > 0 && (
            <Chip label={`-${discountPct}%`} size="small" color="error" sx={{ fontSize: '0.7rem', height: 22 }} />
          )}
        </Box>

        {/* Wishlist */}
        <IconButton
          onClick={handleToggleFavorite}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
        >
          {isFavorite ? <Favorite sx={{ fontSize: 18, color: '#EF4444' }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
        </IconButton>

        {/* Image */}
        <Link href={`/products/${product.slug}`}>
          <Box sx={{ position: 'relative', height: 220, bgcolor: '#F8F9FC' }}>
            <Image
              src={mainImage}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </Box>
        </Link>

        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 2 }}>
          <Link href={`/products/${product.slug}`}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ mb: 1, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', '&:hover': { color: 'primary.main' } }}
            >
              {product.name}
            </Typography>
          </Link>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Rating value={product.rating} precision={0.5} size="small" readOnly sx={{ fontSize: '0.75rem' }} />
            <Typography variant="caption" color="text.secondary">({product.review_count})</Typography>
          </Box>

          {/* Price */}
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ fontSize: '1rem' }}>
              {formatCurrency(product.price)}
            </Typography>
            {product.original_price && (
              <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                {formatCurrency(product.original_price)}
              </Typography>
            )}
          </Box>

          {/* Add to cart */}
          <Box
            className="add-to-cart"
            sx={{ opacity: 0, transform: 'translateY(8px)', transition: 'all 0.25s ease', mt: 1.5 }}
          >
            <Box
              component="button"
              onClick={() => addItem(product)}
              sx={{
                width: '100%', py: 1, border: 'none', borderRadius: 2, cursor: 'pointer',
                background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                color: 'white', fontWeight: 600, fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                '&:hover': { opacity: 0.9 },
              }}
            >
              <ShoppingCartOutlined sx={{ fontSize: 16 }} />
              Tambah ke Keranjang
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
