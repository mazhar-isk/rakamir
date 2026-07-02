'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { apiPatch, useGet } from '@ecommerce/api-client';
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusLabel, OrderStatus } from '@ecommerce/utils';
import { ArrowBack, LocalShipping } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip, Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Step, StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'payment_pending', 'waiting_confirmation', 'waiting_payment', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data: rawOrder, isLoading } = useGet<any>(`/admin/transactions/${params.id}`);
  const { mutate } = useSWRConfig();

  const order = useMemo(() => {
    if (!rawOrder) return null;
    return {
      ...rawOrder,
      status: rawOrder.status?.toLowerCase(),
      order_number: rawOrder.order_number ?? rawOrder.invoice_number ?? rawOrder.id?.slice(0, 8).toUpperCase(),
      total: rawOrder.total ?? rawOrder.grand_total ?? 0,
      shipping_address: rawOrder.shipping_address ?? {
        recipient_name: rawOrder.user?.name ?? rawOrder.user?.full_name ?? rawOrder.customer?.name ?? '-',
        phone: rawOrder.user?.phone ?? rawOrder.user?.phone_number ?? '-',
        address: '-',
        city: '-',
        province: '-',
        postal_code: '-',
      },
    };
  }, [rawOrder]);

  const trackingEvents = useMemo(() => {
    if (!order) return [];
    const baseDate = new Date(order.created_at);

    const addTime = (minutes: number) => {
      const d = new Date(baseDate);
      d.setMinutes(d.getMinutes() + minutes);
      return d.toISOString();
    };

    const status = (order.status || '').toLowerCase();

    // Standard status flows
    const baseEvents = [
      { description: 'Pembayaran Terverifikasi', location: 'Sistem', timestamp: addTime(5) },
      { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString() }
    ];

    if (['paid', 'processing', 'shipped', 'delivered', 'completed'].includes(status)) {
      const timeline = [];

      // If status is completed, prepend order completed milestone
      if (status === 'completed') {
        timeline.push({
          description: 'Pesanan Selesai',
          location: 'Sistem',
          timestamp: order.updated_at || addTime(1500)
        });
      }

      // If order is shipped or later, prepends courier tracking histories
      const histories = order.shipping_histories || order.shipment?.shipping_histories || [];
      if (['shipped', 'delivered', 'completed'].includes(status)) {
        if (histories.length > 0) {
          timeline.push(...histories.map((h: any) => ({
            description: h.description,
            location: h.location || 'Sistem',
            timestamp: h.created_at || h.timestamp,
          })));
        } else {
          // Fallback dummy shipment events if no history is returned yet
          if (['delivered', 'completed'].includes(status)) {
            timeline.push({ description: 'Pesanan Diterima oleh Penerima', location: 'Alamat Tujuan', timestamp: addTime(1440) });
          }
          timeline.push(
            { description: 'Pesanan Sedang Dikirim', location: 'Dalam Perjalanan', timestamp: addTime(240) },
            { description: 'Pesanan Diserahkan ke Kurir', location: 'Logistik Hub', timestamp: addTime(120) }
          );
        }
      }

      // Add "Pesanan Diproses oleh Penjual" milestone for paid or later states
      timeline.push({ description: 'Pesanan Diproses oleh Penjual', location: 'Gudang Penjual', timestamp: addTime(30) });

      // Append verification and creation
      timeline.push(...baseEvents);

      return timeline;
    }

    if (status === 'waiting_confirmation') {
      return [
        { description: 'Menunggu Konfirmasi Pembayaran', location: 'Sistem', timestamp: addTime(5) },
        { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString() }
      ];
    }

    if (status === 'cancelled') {
      return [
        { description: 'Pesanan Dibatalkan', location: 'Sistem', timestamp: addTime(60) },
        { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString() }
      ];
    }

    if (status === 'refunded') {
      return [
        { description: 'Dana Dikembalikan (Refunded)', location: 'Sistem', timestamp: addTime(1440) },
        { description: 'Pesanan Dibatalkan', location: 'Sistem', timestamp: addTime(60) },
        { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString() }
      ];
    }

    // Default (pending / waiting_payment)
    return [
      { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString() }
    ];
  }, [order]);

  const updateStatus = async (status: string) => {
    try {
      await apiPatch(`/admin/orders/${params.id}/status`, { status });
      toast.success('Status diperbarui.');
      mutate(`/admin/transactions/${params.id}`);
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
            {order.items?.map((item: any) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, pb: 2, borderBottom: '1px solid rgba(235, 196, 184, 0.2)' }}>
                <Box sx={{ position: 'relative', width: 64, height: 64, borderRadius: 2, overflow: 'hidden', bgcolor: '#F9F6F2', flexShrink: 0 }}>
                  <Image src={item.image_url || '/placeholder.jpg'} alt={item.product_name} fill style={{ objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600} variant="body2">{item.product_name}</Typography>
                  <Typography variant="caption" color="text.secondary"> × {item.quantity} @ {formatCurrency(item.unit_price)}</Typography>
                </Box>
                <Typography fontWeight={700} variant="body2">{formatCurrency(item.total_price)}</Typography>
              </Box>
            ))}
          </Card>

          {/* Tracking */}
          {trackingEvents && trackingEvents.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <LocalShipping color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight={700}>Tracking Pengiriman</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Kurir: {order.shipment?.courier_name || 'Standard'} · {order.shipment?.tracking_number || "Belum ada resi"}
                  </Typography>
                </Box>
              </Box>
              <Stepper orientation="vertical" activeStep={1}>
                {trackingEvents.map((event: any, i: number) => (
                  <Step key={i} completed>
                    <StepLabel
                      icon={
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: i === 0 ? 'primary.main' : '#E5E7EB',
                            color: i === 0 ? 'white' : 'text.secondary',
                            fontSize: '0.7rem'
                          }}
                        >
                          {trackingEvents.length - i}
                        </Avatar>
                      }
                    >
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
            {[['Subtotal', formatCurrency(order.summary.subtotal)], ['Ongkir', formatCurrency(order.summary.shipping_cost)], ['Diskon', `- ${formatCurrency(order.summary.discount_amount)}`]].map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary" variant="body2">{k}</Typography>
                <Typography variant="body2">{v}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight={700}>Total</Typography>
              <Typography fontWeight={800} color="primary.main">{formatCurrency(order.summary.grand_total)}</Typography>
            </Box>
            <Chip label={order.is_paid ? '✓ Lunas' : '⚠ Belum Bayar'} color={order.is_paid ? 'success' : 'warning'} size="small" sx={{ mt: 2, fontWeight: 600 }} />
          </Card>

          {/* Shipping */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Alamat Pengiriman</Typography>
            <Typography fontWeight={600}>{order.shipment?.recipient_name}</Typography>
            <Typography variant="body2" color="text.secondary">{order.shipment?.recipient_phone}</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {order.shipment?.address}, {order.shipment?.city},{' '}
              {order.shipment?.province} {order.shipment?.postal_code}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">Metode: {order.shipment?.courier_name} - {order.shipment?.service_name}</Typography>
            {order.shipment?.id && (
              <Typography variant="caption" display="block" color="primary.main" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                Resi: {order.shipment?.tracking_number || "Belum ada resi"}
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </BackofficeLayout>
  );
}
