'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { Order, useGet, User } from '@ecommerce/api-client';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel, OrderStatus } from '@ecommerce/utils';
import { ArrowBack, Email, Phone, ShoppingBag } from '@mui/icons-material';
import {
  Avatar, Box, Button, Card, Chip, Divider, Grid, IconButton, Typography,
} from '@mui/material';
import Link from 'next/link';

interface CustomerDetail extends User {
  orders: Order[];
  total_spent: number;
  order_count: number;
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { data: customer, isLoading } = useGet<CustomerDetail>(`/admin/customers/${params.id}`);

  if (isLoading || !customer) {
    return (
      <BackofficeLayout>
        <Typography color="text.secondary">Memuat data pelanggan...</Typography>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href="/customers"><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight={700}>Detail Pelanggan</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', mx: 'auto', mb: 2 }}>
              {customer.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>{customer.name}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>{customer.email}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2">{customer.email}</Typography>
              </Box>
              {customer.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">{customer.phone}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ShoppingBag sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2">Bergabung {formatDate(customer.created_at)}</Typography>
              </Box>
            </Box>
          </Card>

          {/* Stats */}
          <Card sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Statistik</Typography>
            {[
              { label: 'Total Pesanan', value: customer.orders?.length ?? 0 },
              { label: 'Total Belanja', value: formatCurrency(customer.total_spent ?? customer.orders?.reduce((s, o) => s + o.total, 0) ?? 0) },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography fontWeight={700}>{value}</Typography>
              </Box>
            ))}
          </Card>
        </Grid>

        {/* Order history */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Riwayat Pesanan</Typography>
            {(customer.orders ?? []).length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>Belum ada pesanan</Typography>
            ) : (
              (customer.orders ?? []).map((order) => {
                const color = getOrderStatusColor(order.status as OrderStatus);
                return (
                  <Box key={order.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: '1px solid #F3F4F6' }}>
                    <Box>
                      <Typography fontWeight={600} variant="body2" sx={{ fontFamily: 'monospace' }}>#{order.order_number}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(order.created_at)} · {order.items.length} item</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip label={getOrderStatusLabel(order.status as OrderStatus)} size="small" sx={{ bgcolor: `${color}18`, color, fontWeight: 600, fontSize: '0.7rem' }} />
                      <Typography fontWeight={700} color="primary.main">{formatCurrency(order.total)}</Typography>
                      <Button size="small" component={Link} href={`/orders/${order.id}`} variant="outlined" sx={{ minWidth: 0, px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                        Detail
                      </Button>
                    </Box>
                  </Box>
                );
              })
            )}
          </Card>
        </Grid>
      </Grid>
    </BackofficeLayout>
  );
}
