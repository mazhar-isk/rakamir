'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { Order, useGet, User } from '@ecommerce/api-client';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel, OrderStatus } from '@ecommerce/utils';
import { ArrowBack, Email, Phone, ShoppingBag } from '@mui/icons-material';
import {
  Avatar, Box, Button, Card, Chip,
  Grid, IconButton, Typography
} from '@mui/material';
import Link from 'next/link';
import { useMemo } from 'react';

interface CustomerDetail extends User {
  orders: Order[];
  total_spent: number;
  order_count: number;
  total_order: number;
  total_amount: number;
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { data: customer, isLoading: customerLoading } = useGet<any>(`/admin/users/${params.id}`);
  const { data: stats, isLoading: statsLoading } = useGet<any>(`/admin/transactions/users/${params.id}/stats`);
  const { data: transactionsData, isLoading: transactionsLoading } = useGet<any>(
    `/admin/transactions?page=1&limit=20&search=&status=&sort_by=created_at&sort_dir=desc&user_id=${params.id}`
  );

  const isLoading = customerLoading || statsLoading || transactionsLoading;

  const ordersList = useMemo(() => {
    if (!transactionsData) return [];
    if (Array.isArray(transactionsData.data)) return transactionsData.data;
    if (Array.isArray(transactionsData)) return transactionsData;
    return [];
  }, [transactionsData]);

  if (isLoading || !customer) {
    return (
      <BackofficeLayout>
        <Typography color="text.secondary">Memuat data pelanggan...</Typography>
      </BackofficeLayout>
    );
  }

  const customerName = customer.name || customer.full_name || '-';

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
              {customerName[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>{customerName}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>{customer.email}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left', mt: 2 }}>
              {customer.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">{customer.email}</Typography>
                </Box>
              )}
              {customer.phone_number && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">{customer.phone_number}</Typography>
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
              { label: 'Total Pesanan', value: stats?.total_order ?? stats?.total_orders ?? stats?.order_count ?? ordersList.length ?? 0 },
              { label: 'Total Belanja', value: formatCurrency(stats?.total_amount ?? stats?.total_spent ?? 0) },
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
            {ordersList.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>Belum ada pesanan</Typography>
            ) : (
              ordersList.map((order: any) => {
                const color = getOrderStatusColor(order.status?.toLowerCase() as OrderStatus);
                return (
                  <Box key={order.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: '1px solid #F3F4F6' }}>
                    <Box>
                      <Typography fontWeight={600} variant="body2" sx={{ fontFamily: 'monospace' }}>#{order.order_number}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(order.created_at)} · {order.items?.length ?? order.item_count ?? 0} item</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip label={getOrderStatusLabel(order.status?.toLowerCase() as OrderStatus)} size="small" sx={{ bgcolor: `${color}18`, color, fontWeight: 600, fontSize: '0.7rem' }} />
                      <Typography fontWeight={700} color="primary.main">{formatCurrency(order.total ?? order.grand_total ?? 0)}</Typography>
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
