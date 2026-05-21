'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box, Typography, Card, Grid, Chip, Divider, Button,
  Stepper, Step, StepLabel, Avatar, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { ArrowBack, LocalShipping } from '@mui/icons-material';
import { useGet, apiPatch } from '@ecommerce/api-client';
import { Order, ShipmentTracking } from '@ecommerce/api-client';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor, OrderStatus } from '@ecommerce/utils';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import BackofficeLayout from '@/components/layout/BackofficeLayout';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data: order, isLoading } = useGet<Order>(`/admin/orders/${params.id}`);
  const { data: tracking } = useGet<ShipmentTracking>(order?.tracking_number ? `/shipments/${order.tracking_number}` : null);
  const { mutate } = useSWRConfig();

  const updateStatus = async (status: string) => {
    try {
      await apiPatch(`/admin/orders/${params.id}/status`, { status });
      toast.success('Status diperbarui.');
      mutate(`/admin/orders/${params.id}`);
    } catch {
      toast.error('Gagal memperbarui status.');
    }
  };

  if (isLoading || !order) return <BackofficeLayout><Typography>Memuat...</Typography></BackofficeLayout>;

  const statusColor = getOrderStatusColor(order.status as OrderStatus);

  return (
    <BackofficeLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button component={Link} href="/orders" startIcon={<ArrowBack />} variant="text" color="inherit" size="small">Kembali</Button>
          <Typography variant="h5" fontWeight={700}>#{order.order_number}</Typography>
          <Chip label={getOrderStatusLabel(order.status as OrderStatus)} sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 700 }} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Ubah Status</InputLabel>
          <Select value={order.status} label="Ubah Status" onChange={(e) => updateStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{getOrderStatusLabel(s)}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* Items */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Produk ({order.items.length})</Typography>
            {order.items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, pb: 2, borderBottom: '1px solid #F3F4F6' }}>
                <Box sx={{ position: 'relative', width: 64, height: 64, borderRadius: 2, overflow: 'hidden', bgcolor: '#F8F9FC', flexShrink: 0 }}>
                  <Image src={item.product.images?.[0] || '/placeholder.jpg'} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600} variant="body2">{item.product.name}</Typography>
                  {item.variant && <Typography variant="caption" color="text.secondary">Varian: {item.variant.value}</Typography>}
                  <Typography variant="caption" color="text.secondary" display="block">× {item.quantity} @ {formatCurrency(item.price)}</Typography>
                </Box>
                <Typography fontWeight={700} variant="body2">{formatCurrency(item.subtotal)}</Typography>
              </Box>
            ))}
          </Card>

          {/* Tracking */}
          {tracking && (
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <LocalShipping color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight={700}>Tracking Pengiriman</Typography>
                  <Typography variant="caption" color="text.secondary">Kurir: {tracking.courier} · {tracking.tracking_number}</Typography>
                </Box>
              </Box>
              <Stepper orientation="vertical" activeStep={tracking.events.length}>
                {tracking.events.map((event, i) => (
                  <Step key={i} completed>
                    <StepLabel icon={<Avatar sx={{ width: 28, height: 28, bgcolor: i === 0 ? 'primary.main' : '#E5E7EB', fontSize: '0.7rem' }}>{i + 1}</Avatar>}>
                      <Typography variant="body2" fontWeight={600}>{event.description}</Typography>
                      <Typography variant="caption" color="text.secondary">{event.location} · {formatDateTime(event.timestamp)}</Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Summary */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Ringkasan Pembayaran</Typography>
            {[['Subtotal', formatCurrency(order.subtotal)], ['Ongkir', formatCurrency(order.shipping_cost)], ['Diskon', `- ${formatCurrency(order.discount)}`]].map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary" variant="body2">{k}</Typography>
                <Typography variant="body2">{v}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight={700}>Total</Typography>
              <Typography fontWeight={800} color="primary.main">{formatCurrency(order.total)}</Typography>
            </Box>
            <Chip label={order.payment_status === 'paid' ? '✓ Lunas' : '⚠ Belum Bayar'} color={order.payment_status === 'paid' ? 'success' : 'warning'} size="small" sx={{ mt: 2, fontWeight: 600 }} />
          </Card>

          {/* Shipping */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Alamat Pengiriman</Typography>
            <Typography fontWeight={600}>{order.shipping_address.recipient_name}</Typography>
            <Typography variant="body2" color="text.secondary">{order.shipping_address.phone}</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {order.shipping_address.address}, {order.shipping_address.city},{' '}
              {order.shipping_address.province} {order.shipping_address.postal_code}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">Metode: {order.shipping_method}</Typography>
            {order.tracking_number && (
              <Typography variant="caption" display="block" color="primary.main" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                Resi: {order.tracking_number}
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </BackofficeLayout>
  );
}
