'use client';

import React from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Skeleton,
} from '@mui/material';
import {
  TrendingUp, ShoppingBag, People, Inventory2,
  ArrowUpward, ArrowDownward,
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { useGet } from '@ecommerce/api-client';
import { DashboardStats } from '@ecommerce/api-client';
import { formatCurrency } from '@ecommerce/utils';
import BackofficeLayout from '@/components/layout/BackofficeLayout';

const MOCK_REVENUE = [
  { month: 'Jan', revenue: 42000000, orders: 312 },
  { month: 'Feb', revenue: 51000000, orders: 380 },
  { month: 'Mar', revenue: 38000000, orders: 290 },
  { month: 'Apr', revenue: 65000000, orders: 480 },
  { month: 'Mei', revenue: 72000000, orders: 530 },
  { month: 'Jun', revenue: 81000000, orders: 610 },
  { month: 'Jul', revenue: 95000000, orders: 720 },
];

const ORDER_STATUS_DATA = [
  { name: 'Terkirim', value: 540, color: '#22C55E' },
  { name: 'Dikirim', value: 180, color: '#06B6D4' },
  { name: 'Diproses', value: 90, color: '#8B5CF6' },
  { name: 'Pending', value: 45, color: '#F59E0B' },
  { name: 'Dibatalkan', value: 30, color: '#EF4444' },
];

const TOP_PRODUCTS = [
  { name: 'iPhone 15 Pro', sold: 342, revenue: 514000000 },
  { name: 'Nike Air Max', sold: 289, revenue: 86700000 },
  { name: 'Macbook Air M3', sold: 124, revenue: 248000000 },
  { name: 'Samsung TV 55"', sold: 98, revenue: 117000000 },
  { name: 'Dyson V15', sold: 76, revenue: 114000000 },
];

interface StatCardProps {
  title: string; value: string; growth: number;
  icon: React.ReactNode; color: string; loading?: boolean;
}

function StatCard({ title, value, growth, icon, color, loading }: StatCardProps) {
  const isPositive = growth >= 0;
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        {loading ? <Skeleton variant="rounded" height={80} /> : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>{title}</Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}18` }}>{React.cloneElement(icon as any, { sx: { color, fontSize: 22 } })}</Box>
            </Box>
            <Typography variant="h4" fontWeight={800} mb={1}>{value}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isPositive ? <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} /> : <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />}
              <Typography variant="caption" color={isPositive ? 'success.main' : 'error.main'} fontWeight={600}>
                {Math.abs(growth)}% vs bulan lalu
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useGet<DashboardStats>('/admin/dashboard/stats');

  const statCards = [
    { title: 'Total Pendapatan', value: formatCurrency(stats?.total_revenue ?? 0), growth: stats?.revenue_growth ?? 12.5, icon: <TrendingUp />, color: '#6C63FF' },
    { title: 'Total Pesanan', value: (stats?.total_orders ?? 0).toLocaleString(), growth: stats?.order_growth ?? 8.3, icon: <ShoppingBag />, color: '#22C55E' },
    { title: 'Total Pelanggan', value: (stats?.total_customers ?? 0).toLocaleString(), growth: 5.2, icon: <People />, color: '#06B6D4' },
    { title: 'Total Produk', value: (stats?.total_products ?? 0).toLocaleString(), growth: -2.1, icon: <Inventory2 />, color: '#F59E0B' },
  ];

  return (
    <BackofficeLayout>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={0.5}>Selamat datang kembali! 👋</Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>Berikut ringkasan performa toko Anda hari ini.</Typography>

        {/* Stat cards */}
        <Grid container spacing={3} mb={4}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <StatCard {...card} loading={isLoading} />
            </Grid>
          ))}
        </Grid>

        {/* Charts row */}
        <Grid container spacing={3} mb={4}>
          {/* Revenue line chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Pendapatan & Pesanan (7 Bulan Terakhir)</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={MOCK_REVENUE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number, name: string) => name === 'revenue' ? formatCurrency(value) : value} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Pendapatan" stroke="#6C63FF" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Pesanan" stroke="#FF6584" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Order status pie chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Status Pesanan</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={ORDER_STATUS_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {ORDER_STATUS_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {ORDER_STATUS_DATA.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="caption">{item.name}</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={700}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom row */}
        <Grid container spacing={3}>
          {/* Monthly bar chart */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Perbandingan Pendapatan Bulanan</Typography>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={MOCK_REVENUE} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="revenue" name="Pendapatan" fill="#6C63FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Top products */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Produk Terlaris</Typography>
              {TOP_PRODUCTS.map((p, i) => (
                <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: i === 0 ? '#6C63FF' : '#F3F4F6', color: i === 0 ? 'white' : 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                    {i + 1}
                  </Box>
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.sold} terjual</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} color="primary.main" noWrap>{formatCurrency(p.revenue)}</Typography>
                </Box>
              ))}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </BackofficeLayout>
  );
}
