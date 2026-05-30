'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Product, ProductVariant, useGet } from '@ecommerce/api-client';
import { formatCurrency } from '@ecommerce/utils';
import { Add, Favorite, FavoriteBorder, LocalShipping, Remove, Share, Shield, ShoppingCart, SwapHoriz } from '@mui/icons-material';
import { Box, Button, Chip, Container, Divider, Grid, IconButton, Rating, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { data: product, isLoading } = useGet<Product>(`/products/${params.slug}`);
  const { addItem } = useCart();

  const { isAuthenticated } = useAuth();
  const { favoriteIds, toggleFavorite } = useWishlist();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [tab, setTab] = useState(0);

  const isFavorite = product ? favoriteIds.includes(product.id) : false;

  const handleToggleFavorite = () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.info('Silakan login terlebih dahulu untuk menyimpan ke favorit.');
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    toggleFavorite(product.id, product.name);
  };
  // Track selected options: Record<optionId, valueId>
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selected options when product loads
  useEffect(() => {
    if (product?.options && product.options.length > 0) {
      const initial: Record<string, string> = {};
      product.options.forEach((opt) => {
        if (opt.values && opt.values.length > 0) {
          initial[opt.id] = opt.values[0].id;
        }
      });
      setSelectedOptions(initial);
    }
  }, [product]);

  // Reset selected image and quantity when product changes
  useEffect(() => {
    setSelectedImage(0);
    setQty(1);
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

  // Clamp quantity if it exceeds active stock
  useEffect(() => {
    if (currentStock > 0 && qty > currentStock) {
      setQty(currentStock);
    }
  }, [currentStock, qty]);

  const images = useMemo(() => {
    const productImages = product?.images?.length ? product.images : ['/placeholder-product.jpg'];
    const skuPictures = product?.skus
      ?.map((sku) => sku.picture)
      .filter((pic): pic is string => !!pic) || [];
    const uniqueSkuPictures = Array.from(new Set(skuPictures)).filter((pic) => !productImages.includes(pic));
    return [...productImages, ...uniqueSkuPictures];
  }, [product]);

  // Synchronize selectedImage when active SKU picture changes (from selector clicks)
  useEffect(() => {
    if (activeSku?.picture) {
      const idx = images.indexOf(activeSku.picture);
      if (idx !== -1) {
        setSelectedImage(idx);
      }
    } else {
      setSelectedImage(0);
    }
  }, [activeSku?.picture, images]);

  // Check if an option value is disabled in the current selection context
  const isOptionValueDisabled = (optionId: string, valueId: string) => {
    if (!product || !product.skus) return false;
    const testSelection = { ...selectedOptions, [optionId]: valueId };
    return !product.skus.some((sku) => {
      if (!sku.option_values_map) return false;
      return Object.entries(testSelection).every(([oId, vId]) => {
        return sku.option_values_map[oId] === vId;
      });
    });
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

  const handleOptionChange = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => {
      const next = { ...prev, [optionId]: valueId };
      if (product.skus) {
        // Check if the new combination matches a SKU
        const sku = product.skus.find((s) => 
          Object.entries(next).every(([oId, vId]) => s.option_values_map?.[oId] === vId)
        );
        if (sku) {
          if (qty > sku.stock) {
            setQty(Math.max(1, sku.stock));
          }
          return next;
        }

        // Auto-correct to the first valid SKU that supports this option value
        const fallbackSku = product.skus.find((s) => s.option_values_map?.[optionId] === valueId);
        if (fallbackSku && fallbackSku.option_values_map) {
          if (qty > fallbackSku.stock) {
            setQty(Math.max(1, fallbackSku.stock));
          }
          return { ...fallbackSku.option_values_map };
        }
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    // Require login before adding to cart
    if (!isAuthenticated) {
      toast.info('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.');
      router.push(`/auth/login?returnUrl=/products/${params.slug}`);
      return;
    }

    if (product) {
      let variant: ProductVariant | undefined = undefined;
      
      if (product.options && product.options.length > 0 && activeSku) {
        // Build readable variant option text (e.g. "Color: Blue, Size: S")
        const nameParts = product.options.map((opt) => {
          const valId = selectedOptions[opt.id];
          const valObj = opt.values?.find((v) => v.id === valId);
          return valObj ? valObj.value : '';
        }).filter(Boolean);

        variant = {
          id: activeSku.id,
          name: nameParts.join(', '),
          value: activeSku.sku,
          price_modifier: activeSku.price - product.price,
          stock: activeSku.stock,
          picture: activeSku.picture
        };
      }

      if (currentStock === 0) {
        toast.error('Stok varian yang Anda pilih sedang kosong.');
        return;
      }

      addItem(product, qty, variant);
    }
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
    const clickedImage = images[index];
    if (product.skus) {
      const matchingSku = product.skus.find((s) => s.picture === clickedImage);
      if (matchingSku && matchingSku.option_values_map) {
        setSelectedOptions(matchingSku.option_values_map);
      }
    }
  };

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Images */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Box sx={{ position: 'relative', height: 480, borderRadius: 3, overflow: 'hidden', bgcolor: '#FDFBF9', mb: 2, border: '1px solid rgba(235,196,184,0.15)' }}>
                <Image src={images[selectedImage] || '/placeholder-product.jpg'} alt={product.name} fill style={{ objectFit: 'contain' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <Box key={i} onClick={() => handleThumbnailClick(i)} sx={{ position: 'relative', width: 72, height: 72, borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: selectedImage === i ? '2px solid #D26B54' : '2px solid transparent', cursor: 'pointer', bgcolor: '#FDFBF9' }}>
                    <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Info */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Category Chips & Badges */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {product.is_new && <Chip label="Baru" color="primary" size="small" />}
                {product.discount_percentage && <Chip label={`-${product.discount_percentage}%`} color="error" size="small" />}
                {product.categories && product.categories.length > 0 ? (
                  product.categories.map((c) => (
                    <Chip key={c.id} label={c.name} variant="outlined" size="small" sx={{ borderColor: 'primary.light', color: 'primary.main', fontWeight: 600 }} />
                  ))
                ) : (
                  <Chip label={product.category.name} variant="outlined" size="small" />
                )}
              </Box>
              <Typography variant="h4" fontWeight={700} mb={1}>{product.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Rating value={product.rating} precision={0.5} size="small" readOnly />
                <Typography variant="body2" color="text.secondary">({product.review_count} ulasan) · {product.sold_count} terjual</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                <Typography variant="h3" fontWeight={800} color="primary.main">{formatCurrency(currentPrice)}</Typography>
                {currentOriginalPrice && (
                  <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through', fontWeight: 400 }}>
                    {formatCurrency(currentOriginalPrice)}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Dynamic Option Selectors */}
              {product.options && product.options.map((opt) => (
                <Box key={opt.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11, color: 'text.secondary' }}>
                    {opt.name}: <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>{opt.values?.find(v => v.id === selectedOptions[opt.id])?.value}</Box>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {opt.values?.map((val) => {
                      const isSelected = selectedOptions[opt.id] === val.id;
                      const isDisabled = isOptionValueDisabled(opt.id, val.id);
                      const isColor = opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'warna';
                      
                      if (isColor) {
                        const colorHexMap: Record<string, string> = {
                          black: '#1f2937',
                          blue: '#3b82f6',
                          red: '#ef4444',
                          green: '#10b981',
                          white: '#ffffff',
                          gray: '#9ca3af',
                          silver: '#e5e7eb',
                          gold: '#f59e0b',
                          orange: '#f97316',
                        };
                        const hex = colorHexMap[val.value.toLowerCase()] || '#cccccc';
                        
                        return (
                          <Box
                            key={val.id}
                            onClick={() => handleOptionChange(opt.id, val.id)}
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              bgcolor: hex,
                              border: isSelected ? '3px solid #D26B54' : (isDisabled ? '1px dashed #E5E7EB' : '1px solid #E5E7EB'),
                              boxShadow: isSelected ? '0 0 8px rgba(210,107,84,0.3)' : 'none',
                              cursor: 'pointer',
                              opacity: isDisabled ? 0.25 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              position: 'relative',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              }
                            }}
                          >
                            {val.value.toLowerCase() === 'white' && isSelected && (
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#000000' }} />
                            )}
                            {val.value.toLowerCase() !== 'white' && isSelected && (
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ffffff' }} />
                            )}
                          </Box>
                        );
                      }
                      
                      return (
                        <Box
                          key={val.id}
                          onClick={() => handleOptionChange(opt.id, val.id)}
                          sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            border: isSelected ? '2px solid #D26B54' : (isDisabled ? '1px dashed #E5E7EB' : '1px solid rgba(235,196,184,0.4)'),
                            bgcolor: isSelected ? 'rgba(210,107,84,0.06)' : (isDisabled ? '#F9FAFB' : 'white'),
                            color: isSelected ? '#D26B54' : (isDisabled ? '#9CA3AF' : 'text.primary'),
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            opacity: isDisabled ? 0.35 : 1,
                            transition: 'all 0.2s',
                            userSelect: 'none',
                            '&:hover': {
                              borderColor: '#D26B54',
                              bgcolor: 'rgba(210,107,84,0.02)'
                            }
                          }}
                        >
                          <Typography variant="body2">{val.value}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}

              {/* Quantity */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, mt: product.options?.length ? 1 : 3 }}>
                <Typography fontWeight={600}>Jumlah:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(235,196,184,0.4)', borderRadius: 2, overflow: 'hidden' }}>
                  <IconButton onClick={() => setQty(Math.max(1, qty - 1))} size="small" disabled={currentStock === 0}><Remove fontSize="small" /></IconButton>
                  <Typography sx={{ px: 3, minWidth: 40, textAlign: 'center', fontWeight: 600 }}>{currentStock === 0 ? 0 : qty}</Typography>
                  <IconButton onClick={() => setQty(Math.min(currentStock, qty + 1))} size="small" disabled={currentStock === 0}><Add fontSize="small" /></IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {currentStock === 0 ? 'Stok Habis' : `Stok: ${currentStock}`}
                </Typography>
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button variant="contained" size="large" startIcon={<ShoppingCart />} onClick={handleAddToCart} fullWidth
                  disabled={currentStock === 0}
                  sx={{ py: 1.5 }}>
                  {currentStock === 0 ? 'Stok Varian Habis' : 'Tambah ke Keranjang'}
                </Button>
                <IconButton sx={{ border: '1px solid rgba(235,196,184,0.4)', borderRadius: 2, color: isFavorite ? '#D26B54' : 'text.secondary', '&:hover': { borderColor: '#D26B54', color: '#D26B54' }, transition: 'all 0.2s' }} onClick={handleToggleFavorite}>
                  {isFavorite ? <Favorite sx={{ color: 'primary.main' }} /> : <FavoriteBorder />}
                </IconButton>
              </Box>

              {/* Guarantees */}
              <Box sx={{ bgcolor: '#F9F6F2', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid rgba(235,196,184,0.3)', mb: 4 }}>
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
