'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, Grid, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency } from '@ecommerce/utils';
import BackofficeLayout from '@/components/layout/BackofficeLayout';

const REVENUE_DATA = {
  weekly: [
    { label: 'Sen', revenue: 12500000, orders: 94 },
    { label: 'Sel', revenue: 18200000, orders: 128 },
    { label: 'Rab', revenue: 15700000, orders: 110 },
    { label: 'Kam', revenue: 22400000, orders: 176 },
    { label: 'Jum', revenue: 31000000, orders: 240 },
    { label: 'Sab', revenue: 42000000, orders: 310 },
    { label: 'Min', revenue: 28000000, orders: 208 },
  ],
  monthly: [
    { label: 'Jan', revenue: 42000000, orders: 312 },
    { label: 'Feb', revenue: 51000000, orders: 380 },
    { label: 'Mar', revenue: 38000000, orders: 290 },
    { label: 'Apr', revenue: 65000000, orders: 480 },
    { label: 'Mei', revenue: 72000000, orders: 530 },
    { label: 'Jun', revenue: 81000000, orders: 610 },
    { label: 'Jul', revenue: 95000000, orders: 720 },
    { label: 'Agu', revenue: 88000000, orders: 660 },
    { label: 'Sep', revenue: 102000000, orders: 780 },
    { label: 'Okt', revenue: 115000000, orders: 850 },
    { label: 'Nov', revenue: 134000000, orders: 980 },
    { label: 'Des', revenue: 158000000, orders: 1150 },
  ],
};

const CATEGORY_DATA = [
  { name: 'Elektronik', revenue: 450000000, orders: 1240 },
  { name: 'Fashion', revenue: 280000000, orders: 3200 },
  { name: 'Rumah', revenue: 190000000, orders: 860 },
  { name: 'Kecantikan', revenue: 145000000, orders: 2100 },
  { name: 'Olahraga', revenue: 98000000, orders: 740 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const chartData = REVENUE_DATA[period];

  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Laporan & Analitik</Typography>
          <Typography variant="body2" color="text.secondary">Pantau performa penjualan Anda</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Periode</InputLabel>
          <Select value={period} label="Periode" onChange={(e) => setPeriod(e.target.value as any)}>
            <MenuItem value="weekly">Mingguan</MenuItem>
            <MenuItem value="monthly">Bulanan</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Revenue area chart */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Tren Pendapatan</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D26B54" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D26B54" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#D26B54" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Orders bar chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Jumlah Pesanan</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" name="Pesanan" fill="#EBC4B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Category revenue bar chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Pendapatan per Kategori</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={CATEGORY_DATA} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" name="Pendapatan" fill="#D26B54" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Revenue vs Orders combined */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Perbandingan Pendapatan & Pesanan</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number, name: string) => name === 'Pendapatan' ? formatCurrency(v) : v} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Pendapatan" stroke="#D26B54" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Pesanan" stroke="#EBC4B8" strokeWidth={2.5} dot={{ r: 4 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </BackofficeLayout>
  );
}
