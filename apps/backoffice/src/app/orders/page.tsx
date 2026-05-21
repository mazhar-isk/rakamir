'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { apiPatch, Order, usePaginated } from '@ecommerce/api-client';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel, OrderStatus } from '@ecommerce/utils';
import { Search, Visibility } from '@mui/icons-material';
import {
  Box,
  Card, Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem, Select,
  TextField,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const queryString = new URLSearchParams({
    page: String(page + 1), per_page: '10',
    ...(search && { q: search }),
    ...(status && { status }),
  }).toString();

  const { data, isLoading, mutate } = usePaginated<Order>(`/admin/orders?${queryString}`);
  const orders = data?.data ?? [];

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiPatch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status pesanan diperbarui.');
      mutate();
    } catch {
      toast.error('Gagal memperbarui status.');
    }
  };

  const columns: GridColDef[] = [
    { field: 'order_number', headerName: 'No. Pesanan', width: 150, display: 'flex', renderCell: (p) => <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>#{p.value}</Typography> },
    {
      field: 'status', headerName: 'Status', width: 200,
      renderCell: (p: GridRenderCellParams<Order>) => {
        const color = getOrderStatusColor(p.value as OrderStatus);
        return (
          <Select size="small" value={p.value} onClick={(e) => e.stopPropagation()}
            onChange={(e) => updateStatus(p.row.id, e.target.value)}
            sx={{ fontSize: '0.75rem', color, '& .MuiOutlinedInput-notchedOutline': { borderColor: `${color}44` }, bgcolor: `${color}10`, minWidth: 150 }}>
            {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}><Typography variant="caption">{getOrderStatusLabel(s)}</Typography></MenuItem>)}
          </Select>
        );
      },
    },
    { field: 'created_at', headerName: 'Tanggal', width: 140, renderCell: (p) => formatDate(p.value) },
    {
      field: 'customer', headerName: 'Pelanggan', flex: 1, minWidth: 160, display: 'flex',
      renderCell: (p: GridRenderCellParams<Order>) => <Typography variant="body2">{p.row.shipping_address?.recipient_name ?? '-'}</Typography>,
    },
    { field: 'total', headerName: 'Total', width: 150, display: 'flex', renderCell: (p) => <Typography fontWeight={700} color="primary.main">{formatCurrency(p.value)}</Typography> },
    {
      field: 'payment_status', headerName: 'Pembayaran', width: 130, display: 'flex',
      renderCell: (p) => <Chip label={p.value === 'paid' ? 'Lunas' : 'Belum'} size="small" color={p.value === 'paid' ? 'success' : 'warning'} />,
    },
    {
      field: 'actions', headerName: 'Aksi', width: 80, sortable: false,
      renderCell: (p) => (
        <IconButton size="small" component={Link} href={`/orders/${p.row.id}`} color="primary">
          <Visibility fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <BackofficeLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Manajemen Pesanan</Typography>
        <Typography variant="body2" color="text.secondary">{data?.meta.total ?? 0} total pesanan</Typography>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Cari no. pesanan / pelanggan..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ minWidth: 280 }} />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              <MenuItem value="">Semua</MenuItem>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{getOrderStatusLabel(s)}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Card>
        <DataGrid rows={orders} columns={columns} loading={isLoading}
          rowCount={data?.meta.total ?? 0} paginationMode="server"
          paginationModel={{ page, pageSize: 10 }} onPaginationModelChange={(m) => setPage(m.page)}
          pageSizeOptions={[10]} rowHeight={60} disableRowSelectionOnClick
          sx={{ border: 'none', minHeight: 400 }} />
      </Card>
    </BackofficeLayout>
  );
}
