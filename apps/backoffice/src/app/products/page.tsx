'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { apiDelete, Product, usePaginated } from '@ecommerce/api-client';
import { formatCurrency } from '@ecommerce/utils';
import { Add, Delete, Edit, Search, Visibility } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button, Card, Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem, Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import { useConfirm } from '@/contexts/ConfirmContext';

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { mutate } = useSWRConfig();
  const { confirm } = useConfirm();

  const queryString = new URLSearchParams({
    page: String(page + 1), per_page: '10',
    ...(search && { q: search }),
    ...(category && { category }),
  }).toString();

  const { data, isLoading } = usePaginated<Product>(`/admin/products?${queryString}`);
  const products = data?.data ?? [];

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Produk',
      message: 'Yakin ingin menghapus produk ini secara permanen?',
      confirmLabel: 'Ya, Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiDelete(`/admin/products/${id}`);
      toast.success('Produk dihapus.');
      mutate(`/admin/products?${queryString}`);
    } catch {
      toast.error('Gagal menghapus produk.');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: 'Produk', flex: 2, minWidth: 260, display: 'flex',
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar src={params.row.images?.[0]} variant="rounded" sx={{ width: 42, height: 42, bgcolor: '#F9F6F2' }} />
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.category?.name}</Typography>
          </Box>
        </Box>
      ),
    },
    { field: 'price', headerName: 'Harga', width: 140, renderCell: (p) => formatCurrency(p.value) },
    {
      field: 'stock', headerName: 'Stok', width: 90,
      renderCell: (p) => <Chip label={p.value} size="small" color={p.value < 10 ? 'error' : p.value < 30 ? 'warning' : 'success'} />,
    },
    { field: 'sold_count', headerName: 'Terjual', width: 90 },
    { field: 'rating', headerName: 'Rating', width: 90, renderCell: (p) => `⭐ ${p.value?.toFixed(1)}` },
    {
      field: 'is_featured', headerName: 'Status', width: 120, display: 'flex',
      renderCell: (p) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {p.row.is_featured && <Chip label="Featured" size="small" color="primary" sx={{ fontSize: '0.65rem', height: 20 }} />}
          {p.row.is_new && <Chip label="Baru" size="small" color="info" sx={{ fontSize: '0.65rem', height: 20 }} />}
        </Box>
      ),
    },
    {
      field: 'actions', headerName: 'Aksi', width: 120, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="Detail"><IconButton size="small" component={Link} href={`/products/${p.row.id}`}><Visibility fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" component={Link} href={`/products/${p.row.id}/edit`} color="primary"><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => handleDelete(p.row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Manajemen Produk</Typography>
          <Typography variant="body2" color="text.secondary">{data?.meta.total ?? 0} total produk</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button component={Link} href="/products/stock" variant="outlined" color="primary" startIcon={<Edit />}>
            Update Stok SKU
          </Button>
          <Button component={Link} href="/products/new" variant="contained" startIcon={<Add />}>
            Tambah Produk
          </Button>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Cari produk..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ minWidth: 240 }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Kategori</InputLabel>
            <Select value={category} label="Kategori" onChange={(e) => { setCategory(e.target.value); setPage(0); }}>
              <MenuItem value="">Semua</MenuItem>
              <MenuItem value="elektronik">Elektronik</MenuItem>
              <MenuItem value="fashion">Fashion</MenuItem>
              <MenuItem value="rumah">Rumah</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Card>
        <DataGrid
          rows={products}
          columns={columns}
          loading={isLoading}
          rowCount={data?.meta.total ?? 0}
          paginationMode="server"
          paginationModel={{ page, pageSize: 10 }}
          onPaginationModelChange={(m) => setPage(m.page)}
          pageSizeOptions={[10]}
          rowHeight={64}
          disableRowSelectionOnClick
          sx={{ border: 'none', minHeight: 400 }}
        />
      </Card>
    </BackofficeLayout>
  );
}
