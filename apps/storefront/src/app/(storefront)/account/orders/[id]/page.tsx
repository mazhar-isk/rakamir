'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { ShipmentTracking, useGet } from '@ecommerce/api-client';
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
      payment_method: 'Midtrans / Transfer Bank',
      payment_status: rawOrder.is_paid ? 'paid' : 'pending',
    };
  }, [rawOrder]);

  const { data: tracking } = useGet<ShipmentTracking>(
    order?.tracking_number ? `/shipments/${order.tracking_number}` : null
  );

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
            {tracking && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>Lacak Pengiriman</Typography>
                  <Box>
                    <Typography variant="caption" color="text.secondary">No. Resi</Typography>
                    <Typography fontWeight={700} sx={{ fontFamily: 'monospace' }}>{tracking.tracking_number}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: '#FAF5F2', borderRadius: 2, border: '1px solid rgba(235,196,184,0.2)' }}>
                  <LocalShipping sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Kurir</Typography>
                    <Typography fontWeight={600}>{tracking.courier}</Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Est. Tiba</Typography>
                    <Typography fontWeight={600}>{tracking.estimated_delivery}</Typography>
                  </Box>
                </Box>

                <Stepper orientation="vertical" activeStep={tracking.events.length}>
                  {tracking.events.map((event, i) => (
                    <Step key={i} completed>
                      <StepLabel
                        icon={
                          <Avatar sx={{ width: 32, height: 32, bgcolor: i === 0 ? 'primary.main' : '#E5E7EB', color: i === 0 ? 'white' : 'text.secondary' }}>
                            {trackingIcons[event.status] ?? trackingIcons.default}
                          </Avatar>
                        }
                      >
                        <Typography fontWeight={600} variant="body2">{event.description}</Typography>
                        <Typography variant="caption" color="text.secondary">{event.location}</Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="caption" color="text.secondary">{formatDateTime(event.timestamp)}</Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Card>
            )}

            {!tracking && order.tracking_number && (
              <Card sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                <LocalShipping sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">Data tracking sedang dimuat...</Typography>
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
