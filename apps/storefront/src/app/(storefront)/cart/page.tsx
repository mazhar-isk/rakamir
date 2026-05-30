'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@ecommerce/utils';
import { Add, ArrowForward, Delete, Remove } from '@mui/icons-material';
import { Box, Button, Card, Container, Divider, IconButton, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
          <Typography fontSize={80} mb={2}>🛒</Typography>
          <Typography variant="h5" fontWeight={700} mb={1}>Keranjang Kosong</Typography>
          <Typography color="text.secondary" mb={4}>Yuk belanja dulu! Temukan produk impian Anda.</Typography>
          <Button component={Link} href="/products" variant="contained" size="large">
            Mulai Belanja
          </Button>
        </Container>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>Keranjang Belanja ({itemCount} item)</Typography>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Items */}
          <Box sx={{ flex: 1 }}>
            {items.map((item) => (
              <Card key={item.id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ position: 'relative', width: 100, height: 100, flexShrink: 0, borderRadius: 2, overflow: 'hidden', bgcolor: '#F9F6F2' }}>
                    <Image src={item.variant?.picture || item.product.images?.[0] || '/placeholder-product.jpg'} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600} mb={0.5}>{item.product.name}</Typography>
                    {item.variant && <Typography variant="caption" color="text.secondary">Varian: {item.variant.value}</Typography>}
                    <Typography color="primary.main" fontWeight={700} mt={1}>
                      {formatCurrency(item.product.price + (item.variant?.price_modifier ?? 0))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <IconButton size="small" color="error" onClick={() => removeItem(item.id)}><Delete fontSize="small" /></IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 2 }}>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><Remove fontSize="small" /></IconButton>
                      <Typography sx={{ px: 2, fontWeight: 600 }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Add fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>

          {/* Summary */}
          <Box sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0 }}>
            <Card sx={{ p: 3, position: 'sticky', top: 90 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Ringkasan Pesanan</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary">Subtotal ({itemCount} item)</Typography>
                <Typography fontWeight={600}>{formatCurrency(total)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary">Ongkos kirim</Typography>
                <Typography color="success.main" fontWeight={600}>Gratis</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography fontWeight={700} variant="h6">Total</Typography>
                <Typography fontWeight={800} variant="h6" color="primary.main">{formatCurrency(total)}</Typography>
              </Box>
              <Button component={Link} href="/checkout" variant="contained" fullWidth size="large" endIcon={<ArrowForward />}>
                Lanjut ke Checkout
              </Button>
            </Card>
          </Box>
        </Box>
      </Container>
    </StorefrontLayout>
  );
}
