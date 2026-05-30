'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Card, Chip, Grid, Skeleton, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useGet } from '@ecommerce/api-client';
import { Order, PaginatedResponse } from '@ecommerce/api-client';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor, OrderStatus } from '@ecommerce/utils';
import StorefrontLayout from '@/components/layout/StorefrontLayout';

export default function OrdersPage() {
  const { data, isLoading } = useGet<PaginatedResponse<Order>>('/account/orders?per_page=10');
  const orders = data?.data ?? [];

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={700} mb={5}>Pesanan Saya</Typography>

        {isLoading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} key={i}><Skeleton variant="rounded" height={120} /></Grid>
            ))}
          </Grid>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography fontSize={64} mb={2}>📦</Typography>
            <Typography variant="h6" fontWeight={700} mb={1}>Belum ada pesanan</Typography>
            <Typography color="text.secondary" mb={4}>Mulai belanja dan pesanan Anda akan muncul di sini.</Typography>
            <Button component={Link} href="/products" variant="contained">
              Mulai Belanja
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orders.map((order) => {
              const statusColor = getOrderStatusColor(order.status as OrderStatus);
              return (
                <Card key={order.id} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Typography fontWeight={700}>#{order.order_number}</Typography>
                        <Chip label={getOrderStatusLabel(order.status as OrderStatus)} size="small" sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 600 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(order.created_at)} · {order.items.length} produk
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">Total Pembayaran</Typography>
                        <Typography fontWeight={700} color="primary.main">{formatCurrency(order.total)}</Typography>
                      </Box>
                      <Button component={Link} href={`/account/orders/${order.id}`} endIcon={<ArrowForward />} size="small" variant="outlined">
                        Detail
                      </Button>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </StorefrontLayout>
  );
}
