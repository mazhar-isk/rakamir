'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useGet } from '@ecommerce/api-client';
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusLabel, OrderStatus } from '@ecommerce/utils';
import { AccessTime, ArrowBack, CheckCircle, Inventory, LocalShipping } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card, Chip,
  Container,
  Divider,
  Grid, Skeleton,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';

const trackingIcons: Record<string, React.ReactNode> = {
  picked_up: <Inventory sx={{ fontSize: 18 }} />,
  in_transit: <LocalShipping sx={{ fontSize: 18 }} />,
  delivered: <CheckCircle sx={{ fontSize: 18 }} />,
  default: <AccessTime sx={{ fontSize: 18 }} />,
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data: rawOrder, isLoading: orderLoading } = useGet<any>(`/transactions/${params.id}`);

  const order = useMemo(() => {
    if (!rawOrder) return null;

    const subtotal = rawOrder.summary?.subtotal || 0;
    const shipping_cost = rawOrder.summary?.shipping_cost || 0;
    const discount = rawOrder.summary?.discount_amount || 0;
    const total = rawOrder.summary?.grand_total || 0;

    const items = (rawOrder.items || []).map((item: any) => ({
      id: item.id,
      product: {
        id: item.product_id,
        name: item.product_name || '-',
        images: item.image_url ? [item.image_url] : [],
      },
      variant: undefined,
      quantity: item.quantity,
      subtotal: item.total_price || 0,
    }));

    const shipping_address = {
      recipient_name: rawOrder.shipment?.recipient_name || rawOrder.customer?.name || '-',
      phone: rawOrder.shipment?.recipient_phone || rawOrder.customer?.phone_number || '-',
      address: rawOrder.shipment?.address || rawOrder.customer?.address || '-',
      city: rawOrder.shipment?.city || rawOrder.customer?.city || '-',
      province: rawOrder.shipment?.province || rawOrder.customer?.province || '-',
      postal_code: rawOrder.shipment?.postal_code || rawOrder.customer?.postal_code || '-',
    };

    return {
      ...rawOrder,
      order_number: rawOrder.order_number || rawOrder.id.slice(0, 8).toUpperCase(),
      subtotal,
      shipping_cost,
      discount,
      total,
      items,
      shipping_address,
      tracking_number: rawOrder.shipment?.tracking_number || undefined,
      shipping_histories: rawOrder.shipping_histories || rawOrder.shipment?.shipping_histories || [],
      courier: rawOrder.shipment?.courier_name || 'Standard',
      estimated_delivery: rawOrder.shipment?.estimated_delivery_date || '-',
      payment_method: 'Midtrans / Transfer Bank',
      payment_status: rawOrder.is_paid ? 'paid' : 'pending',
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
      { description: 'Pembayaran Terverifikasi', location: 'Sistem', timestamp: addTime(5), status: 'default' },
      { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString(), status: 'default' }
    ];

    if (['paid', 'processing', 'shipped', 'delivered', 'completed'].includes(status)) {
      const timeline = [];

      // If status is completed, prepend order completed milestone
      if (status === 'completed') {
        timeline.push({
          description: 'Pesanan Selesai',
          location: 'Sistem',
          timestamp: order.updated_at || addTime(1500),
          status: 'delivered'
        });
      }

      // If order is shipped or later, prepends courier tracking histories
      const histories = order.shipping_histories || [];
      if (['shipped', 'delivered', 'completed'].includes(status)) {
        if (histories.length > 0) {
          timeline.push(...histories.map((h: any) => ({
            description: h.description,
            location: h.location || 'Sistem',
            timestamp: h.created_at || h.timestamp,
            status: h.status || 'default'
          })));
        } else {
          // Fallback dummy shipment events if no history is returned yet
          if (['delivered', 'completed'].includes(status)) {
            timeline.push({ description: 'Pesanan Diterima oleh Penerima', location: 'Alamat Tujuan', timestamp: addTime(1440), status: 'delivered' });
          }
          timeline.push(
            { description: 'Pesanan Sedang Dikirim', location: 'Dalam Perjalanan', timestamp: addTime(240), status: 'in_transit' },
            { description: 'Pesanan Diserahkan ke Kurir', location: 'Logistik Hub', timestamp: addTime(120), status: 'picked_up' }
          );
        }
      }

      // Add "Pesanan Diproses oleh Penjual" milestone for paid or later states
      timeline.push({ description: 'Pesanan Diproses oleh Penjual', location: 'Gudang Penjual', timestamp: addTime(30), status: 'picked_up' });

      // Append verification and creation
      timeline.push(...baseEvents);

      return timeline;
    }

    if (status === 'waiting_confirmation') {
      return [
        { description: 'Menunggu Konfirmasi Pembayaran', location: 'Sistem', timestamp: addTime(5), status: 'default' },
        { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString(), status: 'default' }
      ];
    }

    if (status === 'cancelled') {
      return [
        { description: 'Pesanan Dibatalkan', location: 'Sistem', timestamp: addTime(60), status: 'default' },
        { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString(), status: 'default' }
      ];
    }

    if (status === 'refunded') {
      return [
        { description: 'Dana Dikembalikan (Refunded)', location: 'Sistem', timestamp: addTime(1440), status: 'default' },
        { description: 'Pesanan Dibatalkan', location: 'Sistem', timestamp: addTime(60), status: 'default' },
        { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString(), status: 'default' }
      ];
    }

    // Default (pending / waiting_payment)
    return [
      { description: 'Pesanan Dibuat', location: 'Sistem', timestamp: baseDate.toISOString(), status: 'default' }
    ];
  }, [order]);

  if (orderLoading) {
    return (
      <StorefrontLayout>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} width={300} />
          <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={300} />
        </Container>
      </StorefrontLayout>
    );
  }

  if (!order) return null;

  const statusColor = getOrderStatusColor(order.status.toLowerCase() as OrderStatus);

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button component={Link} href="/account/orders" startIcon={<ArrowBack />} variant="text" color="inherit">
            Kembali
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h5" fontWeight={700}>Detail Pesanan #{order.order_number || '-'}</Typography>
          <Chip
            label={getOrderStatusLabel(order.status.toLowerCase() as OrderStatus)}
            sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 700 }}
          />
        </Box>

        <Grid container spacing={4}>
          {/* Left */}
          <Grid item xs={12} md={8}>
            {/* Items */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Produk Dipesan</Typography>
              {(order.items || []).map((item: any) => (
                <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, pb: 2, borderBottom: '1px solid #F3F4F6' }}>
                  <Box sx={{ position: 'relative', width: 72, height: 72, borderRadius: 2, overflow: 'hidden', bgcolor: '#FDFBF9', border: '1px solid rgba(235,196,184,0.15)', flexShrink: 0 }}>
                    <Image src={item.product.images?.[0] || 'https://picsum.photos/seed/food/200'} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600} mb={0.5}>{item.product.name}</Typography>
                    {item.variant && <Typography variant="caption" color="text.secondary">Varian: {item.variant.value}</Typography>}
                    <Typography variant="body2" color="text.secondary">× {item.quantity}</Typography>
                  </Box>
                  <Typography fontWeight={700}>{formatCurrency(item.subtotal)}</Typography>
                </Box>
              ))}
            </Card>

            {/* Shipment Tracking */}
            {trackingEvents && trackingEvents.length > 0 && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>Lacak Pengiriman</Typography>
                  <Box>
                    <Typography variant="caption" color="text.secondary">No. Resi</Typography>
                    <Typography fontWeight={700} sx={{ fontFamily: 'monospace' }}>{order.tracking_number || "Belum ada resi"}</Typography>
                  </Box>
                </Box>
                {order.tracking_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: '#FAF5F2', borderRadius: 2, border: '1px solid rgba(235,196,184,0.2)' }}>
                    <LocalShipping sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Kurir</Typography>
                      <Typography fontWeight={600}>{order.courier}</Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">Est. Tiba</Typography>
                      <Typography fontWeight={600}>{order.estimated_delivery}</Typography>
                    </Box>
                  </Box>
                )}

                <Stepper orientation="vertical" activeStep={1}>
                  {trackingEvents.map((event: any, i: number) => (
                    <Step key={i} completed>
                      <StepLabel
                        icon={
                          <Avatar sx={{ width: 32, height: 32, bgcolor: i === 0 ? 'primary.main' : '#E5E7EB', color: i === 0 ? 'white' : 'text.secondary' }}>
                            {trackingIcons[event.status] ?? trackingIcons.default}
                          </Avatar>
                        }
                      >
                        <Typography fontWeight={600} variant="body2" color={i === 0 ? 'primary.main' : 'text.primary'}>{event.description}</Typography>
                        <Typography variant="caption" color="text.secondary">{event.location} · {formatDateTime(event.timestamp)}</Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Card>
            )}
          </Grid>

          {/* Right */}
          <Grid item xs={12} md={4}>
            {/* Summary */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Ringkasan Pembayaran</Typography>
              {[
                { label: 'Subtotal', value: formatCurrency(order.subtotal) },
                { label: 'Ongkos Kirim', value: formatCurrency(order.shipping_cost) },
                { label: 'Diskon', value: `- ${formatCurrency(order.discount)}` },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography>{value}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={800} color="primary.main">{formatCurrency(order.total)}</Typography>
              </Box>
            </Card>

            {/* Shipping address */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Alamat Pengiriman</Typography>
              <Typography fontWeight={600}>{order?.shipping_address?.recipient_name || '-'}</Typography>
              <Typography variant="body2" color="text.secondary">{order?.shipping_address?.phone || '-'}</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {order?.shipping_address?.address || '-'}, {order?.shipping_address?.city || '-'}, {' '}
                {order?.shipping_address?.province || '-'} {order?.shipping_address?.postal_code || '-'}
              </Typography>
            </Card>

            {/* Payment info */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Metode Pembayaran</Typography>
              <Typography fontWeight={600} textTransform="capitalize">{order?.payment_method?.replace('_', ' ')}</Typography>
              <Chip
                label={order.is_paid ? 'Sudah Dibayar' : 'Belum Dibayar'}
                size="small"
                color={order.is_paid ? 'success' : 'warning'}
                sx={{ mt: 1 }}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </StorefrontLayout>
  );
}
